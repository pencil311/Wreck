import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { FOODS } from "@/domain/nutrition/foods";
import { normalizeItems, type RawScanItem } from "@/domain/nutrition/photo-estimate";
import type { PhotoMime } from "@/lib/store/types";

/**
 * Photo meal analysis. Mirrors api/coach/route.ts: graceful when the key is
 * missing or the call fails. Vision identifies items and estimates portions;
 * web search fills in nutrition for items not in the WRECK database. Our code
 * (photo-estimate) then OVERRIDES any database match's numbers from FOODS, so
 * the model never decides a database number. Nothing is logged here; the review
 * sheet lets the user edit, then logPhotoMealAction writes it.
 *
 * Verified against platform.claude.com (cached 2026-09-25): web search tool
 * `web_search_20260209`, model default `claude-sonnet-5-5`.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, PhotoMime> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp"
};

// Simple per-user in-memory rate limit: 20 scans / hour.
const RATE = new Map<string, number[]>();
function rateLimited(userId: string): boolean {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const hits = (RATE.get(userId) ?? []).filter((t) => t > hourAgo);
  if (hits.length >= 20) {
    RATE.set(userId, hits);
    return true;
  }
  hits.push(now);
  RATE.set(userId, hits);
  return false;
}

function newPhotoId(): string {
  return "ph_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

const scanItemSchema = z.object({
  name: z.string(),
  portion: z.string().optional(),
  units: z.number().optional(),
  kcal: z.number().optional(),
  proteinG: z.number().optional(),
  carbsG: z.number().optional(),
  fatG: z.number().optional(),
  dbFoodId: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  sources: z.array(z.object({ title: z.string(), url: z.string() })).optional()
});
const scanResultSchema = z.object({ items: z.array(scanItemSchema).max(12) });

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (rateLimited(user.id)) {
    return NextResponse.json({ error: "Too many scans. Try again later." }, { status: 429 });
  }

  // ---- parse + validate upload ----
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  const files = form.getAll("images").filter((f): f is File => f instanceof File);
  const note = String(form.get("note") ?? "").slice(0, 200);

  if (files.length === 0 || files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: "Attach 1 to 6 photos." }, { status: 400 });
  }
  const photos: { id: string; mime: PhotoMime; bytes: Buffer }[] = [];
  for (const f of files) {
    const mime = ALLOWED[f.type];
    if (!mime) return NextResponse.json({ error: "Only JPEG, PNG or WebP." }, { status: 400 });
    if (f.size > MAX_BYTES) return NextResponse.json({ error: "A photo is too large." }, { status: 400 });
    photos.push({ id: newPhotoId(), mime, bytes: Buffer.from(await f.arrayBuffer()) });
  }

  // ---- persist (photos are saved regardless of whether analysis runs) ----
  const store = getStore();
  for (const p of photos) await store.putPhoto(user.id, p.id, p.bytes, p.mime);
  const photoIds = photos.map((p) => p.id);

  // ---- no key: manual entry path, photos still saved ----
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ photoIds, items: [], source: "manual" });
  }

  // ---- analyse ----
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const model = process.env.FOOD_SCAN_MODEL || "claude-sonnet-5-5";

    const foodList = FOODS.map((f) => `${f.id} | ${f.name} | ${f.unit}`).join("\n");
    const system = [
      "You identify foods in meal photos for a fitness app and return structured JSON only.",
      "For each distinct food item visible: give a short name, the portion in household units and estimated grams, and an estimated unit count.",
      "First compare against the WRECK FOOD LIST provided. If an item genuinely matches one, set dbFoodId to that id and estimate units of that food; do not force a match.",
      "For items not in the list, use web search to find per-100g or per-serving nutrition from reputable sources (government/IFCT tables, USDA FoodData Central, reputable nutrition or restaurant pages), scale to the estimated portion, and include the source URLs you actually used.",
      "Give a confidence level (high/medium/low) per item. If you cannot identify something, say so with low confidence rather than inventing a dish.",
      "Do not use emojis or em dashes.",
      'Answer with ONLY a JSON object: {"items":[{"name","portion","units","kcal","proteinG","carbsG","fatG","dbFoodId"?,"confidence","sources"?:[{"title","url"}]}]}. No prose, no code fence.'
    ].join("\n");

    const imageBlocks = photos.map((p) => ({
      type: "image" as const,
      source: { type: "base64" as const, media_type: p.mime, data: p.bytes.toString("base64") }
    }));
    const userText =
      `WRECK FOOD LIST (id | name | unit):\n${foodList}\n\n` +
      (note ? `User note: ${note}\n\n` : "") +
      "Identify every food in these photos and return the JSON.";

    async function run(repair: boolean) {
      return client.messages.create(
        {
          model,
          max_tokens: 2500,
          system,
          tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 } as never],
          messages: [
            {
              role: "user",
              content: repair
                ? [{ type: "text", text: "Return ONLY the JSON object described, nothing else." }]
                : [...imageBlocks, { type: "text", text: userText }]
            }
          ]
        },
        { timeout: 60_000 }
      );
    }

    function textOf(resp: Awaited<ReturnType<typeof run>>): string {
      return resp.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    }

    let parsed: z.infer<typeof scanResultSchema> | null = null;
    try {
      const resp = await run(false);
      parsed = scanResultSchema.parse(extractJson(textOf(resp)));
    } catch {
      try {
        const resp2 = await run(true); // one repair retry
        parsed = scanResultSchema.parse(extractJson(textOf(resp2)));
      } catch {
        parsed = null;
      }
    }

    if (!parsed) {
      return NextResponse.json({
        photoIds,
        items: [],
        source: "photo",
        error: "We couldn't read the plate automatically. Enter the details below."
      });
    }

    const items = normalizeItems(parsed.items as RawScanItem[]);
    return NextResponse.json({ photoIds, items, source: "photo" });
  } catch {
    // Any failure still returns the saved photos so the user can log manually.
    return NextResponse.json({
      photoIds,
      items: [],
      source: "photo",
      error: "Analysis is unavailable right now. Enter the details below."
    });
  }
}
