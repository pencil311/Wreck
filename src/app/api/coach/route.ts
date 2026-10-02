import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { targetsFor } from "@/lib/data";
import {
  buildCoachContext,
  deterministicReply,
  inferIntent,
  type CoachContext,
  type QuickActionKey
} from "@/domain/coach/explain";
import { coachSchema } from "@/lib/validation";

/**
 * AI coach endpoint. Two modes, both powered by Gemini when GEMINI_API_KEY is set
 * (and both falling back to a deterministic reply with no key):
 *
 *  - Grounded mode (a known quick action / plan question): the deterministic
 *    engine produces the factual answer from the user's real data, and Gemini only
 *    rephrases it. It may not invent a plan or state numbers we did not provide.
 *  - Conversation mode (general chat the engine does not recognize): Gemini answers
 *    naturally as a fitness coach, personalized by the user's context and aware of
 *    the recent conversation, but still a coach, not a general assistant, and still
 *    deferring medical/injury/supplement-safety to professionals.
 */

const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

function contextBlock(ctx: CoachContext): string {
  return JSON.stringify(
    {
      name: ctx.displayName,
      goal: ctx.goal,
      mode: ctx.mode,
      targets: ctx.targets
        ? { calories: ctx.targets.calories, proteinG: ctx.targets.proteinG }
        : null,
      todayWorkout: ctx.todayWorkoutLabel,
      readiness: ctx.latestReadiness ?? null
    },
    null,
    0
  );
}

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  contents: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const res = await fetch(GEMINI_ENDPOINT(model), {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      // 3.8-flash always "thinks" (~300-400 hidden tokens) and ignores
      // thinkingBudget, so the cap must cover thinking plus the reply.
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
    })
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (json.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
  }
  const parsed = coachSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const text = parsed.data.text?.trim() ?? "";
  const explicitIntent = parsed.data.intent as QuickActionKey | undefined;
  const matchedIntent = explicitIntent ?? inferIntent(text);
  // Free text with no recognized intent is open conversation.
  const conversational = !matchedIntent && text.length > 0;

  const data = await getStore().getData(user.id);
  const targets = targetsFor(data);
  const ctx = buildCoachContext(user.displayName, data, targets);
  const grounded = deterministicReply({ intent: matchedIntent, text }, ctx);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No AI: grounded answers still work; general chat gets the deterministic
    // "here is what I can do" reply.
    return NextResponse.json({ reply: grounded, source: "deterministic" });
  }

  try {
    const model = process.env.COACH_MODEL || "gemini-3.8-flash";

    if (conversational) {
      const system = [
        "You are the WRECK coach, a knowledgeable and supportive fitness coach inside the WRECK app.",
        "Have a natural, encouraging conversation. Answer the user's training, nutrition, recovery and motivation questions clearly and briefly.",
        "Use CONTEXT (the user's real profile and plan) to personalize your answer where relevant.",
        "Hard rules:",
        "- You are a fitness coach, not a general assistant. If asked something unrelated to fitness, health, nutrition, training, recovery or motivation, gently steer back to how you can help their training.",
        "- Do not state specific numeric targets or plan details for THIS user unless they appear in CONTEXT. Otherwise speak in general terms and point them to the relevant app screen.",
        "- For medical, injury or supplement-safety questions, give general information and advise speaking to a qualified professional.",
        "- Do not use emojis or em dashes. Keep replies under 150 words.",
        `CONTEXT: ${contextBlock(ctx)}`
      ].join("\n");

      // Build multi-turn contents from history, mapping coach -> model, and
      // dropping any leading model turns so it starts with a user turn.
      const mapped = (parsed.data.history ?? [])
        .slice(-10)
        .map((m) => ({
          role: (m.role === "coach" ? "model" : "user") as "user" | "model",
          parts: [{ text: m.text }]
        }));
      while (mapped.length && mapped[0].role === "model") mapped.shift();
      mapped.push({ role: "user", parts: [{ text }] });

      const reply = await callGemini(apiKey, model, system, mapped);
      return NextResponse.json({ reply: reply || grounded, source: reply ? "ai" : "deterministic" });
    }

    // Grounded mode: rephrase the deterministic answer, add no new facts.
    const system = [
      "You are the WRECK coach. WRECK is a personalized fitness operating system.",
      "You speak briefly, plainly and supportively, like a knowledgeable coach.",
      "Hard rules:",
      "- Only explain WRECK's existing plan and the facts provided in CONTEXT and GROUNDED_ANSWER.",
      "- Never invent a second training or nutrition plan, and never state nutrition numbers not present in the context.",
      "- For medical, injury or supplement-safety questions, advise speaking to a qualified professional.",
      "- Do not use emojis or em dashes.",
      "- Keep the reply under 130 words.",
      "Rephrase GROUNDED_ANSWER naturally for this user; do not contradict it or add new numeric facts."
    ].join("\n");

    const userText = text || `Quick action: ${explicitIntent}`;
    const reply = await callGemini(apiKey, model, system, [
      {
        role: "user",
        parts: [{ text: `CONTEXT: ${contextBlock(ctx)}\n\nGROUNDED_ANSWER: ${grounded}\n\nUSER MESSAGE: ${userText}` }]
      }
    ]);
    return NextResponse.json({ reply: reply || grounded, source: reply ? "ai" : "deterministic" });
  } catch (e) {
    console.error("coach gemini call failed:", e);
    return NextResponse.json({ reply: grounded, source: "deterministic" });
  }
}
