import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStore } from "@/lib/store";
import { targetsFor } from "@/lib/data";
import {
  buildCoachContext,
  deterministicReply,
  type QuickActionKey
} from "@/domain/coach/explain";
import { coachSchema } from "@/lib/validation";

/**
 * AI coach endpoint.
 *
 * The deterministic explanation engine always produces the answer's factual
 * content from the user's real profile/program/logs. When GEMINI_API_KEY is
 * present the answer is rephrased conversationally by Google Gemini, constrained
 * by a strict system prompt: it may only explain WRECK's decisions and the facts
 * we pass in, never invent a plan or fabricate database numbers. With no key the
 * deterministic reply is returned directly, so the coach always works.
 */
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

  const data = await getStore().getData(user.id);
  const targets = targetsFor(data);
  const ctx = buildCoachContext(user.displayName, data, targets);
  const grounded = deterministicReply(
    { intent: parsed.data.intent as QuickActionKey | undefined, text: parsed.data.text },
    ctx
  );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: grounded, source: "deterministic" });
  }

  try {
    const model = process.env.COACH_MODEL || "gemini-2.5-flash";

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

    const userText = parsed.data.text?.trim() || `Quick action: ${parsed.data.intent}`;
    const contextBlock = JSON.stringify(
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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `CONTEXT: ${contextBlock}\n\nGROUNDED_ANSWER: ${grounded}\n\nUSER MESSAGE: ${userText}`
              }
            ]
          }
        ],
        // Disable "thinking" so the token budget goes to the short reply, not
        // hidden reasoning (relevant for the 2.5-flash default).
        generationConfig: { maxOutputTokens: 400, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
      })
    });

    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = (json.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("")
      .trim();

    return NextResponse.json({ reply: text || grounded, source: text ? "ai" : "deterministic" });
  } catch (e) {
    // Any AI failure falls back to the grounded deterministic reply.
    console.error("coach gemini call failed:", e);
    return NextResponse.json({ reply: grounded, source: "deterministic" });
  }
}
