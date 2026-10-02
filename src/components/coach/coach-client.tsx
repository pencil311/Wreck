"use client";

import { useRef, useState } from "react";
import { QUICK_ACTIONS, type QuickActionKey } from "@/domain/coach/explain";
import { Button, Card, Chip } from "@/components/ui/primitives";
import { IconArrow } from "@/components/icons";

interface Msg {
  role: "user" | "coach";
  text: string;
  source?: "ai" | "deterministic";
}

export function CoachClient({ greeting }: { greeting: string }) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "coach", text: greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(payload: { intent?: QuickActionKey; text?: string }, label: string) {
    setMessages((m) => [...m, { role: "user", text: label }]);
    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "coach", text: data.reply ?? "Something went wrong.", source: data.source }]);
    } catch {
      setMessages((m) => [...m, { role: "coach", text: "I could not reach the coach. Please try again." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
    }
  }

  function submitText() {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    void send({ text: t }, t);
  }

  return (
    <div className="flex flex-col">
      <div className="no-scrollbar -mx-1 mb-4 flex flex-wrap gap-2 px-1">
        {QUICK_ACTIONS.map((qa) => (
          <Chip key={qa.key} disabled={busy} onClick={() => send({ intent: qa.key }, qa.label)}>
            {qa.label}
          </Chip>
        ))}
      </div>

      <div ref={listRef} className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <Card
              className={
                "max-w-[85%] px-4 py-3 " +
                (m.role === "user" ? "bg-ember/10 border-ember/30" : "")
              }
            >
              <p className="whitespace-pre-line text-sm leading-relaxed text-bone">{m.text}</p>
            </Card>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <Card className="px-4 py-3">
              <span className="inline-flex gap-1">
                <Dot /> <Dot /> <Dot />
              </span>
            </Card>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-ink-line pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitText()}
          placeholder="Ask about today, your targets, or a change"
          className="flex-1 rounded-sm border border-ink-line bg-ink px-3.5 py-3 text-sm text-bone placeholder:text-bone-faint focus:border-ember/60"
        />
        <Button onClick={submitText} disabled={busy || !input.trim()} aria-label="Send">
          <IconArrow size={18} />
        </Button>
      </div>
      <p className="mt-3 text-xs text-bone-faint">
        The coach explains your plan from your real data. For medical or injury questions, please see
        a qualified professional.
      </p>
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-bone-faint" />;
}
