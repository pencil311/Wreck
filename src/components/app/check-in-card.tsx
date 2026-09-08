"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkInAction } from "@/app/actions";
import { Button, Card, Ring } from "@/components/ui/primitives";

type Scale = 1 | 2 | 3 | 4 | 5;
const FIELDS: { key: "energy" | "sleep" | "soreness" | "stress"; label: string; invert?: boolean }[] = [
  { key: "energy", label: "Energy" },
  { key: "sleep", label: "Sleep quality" },
  { key: "soreness", label: "Soreness", invert: true },
  { key: "stress", label: "Stress", invert: true }
];

/**
 * The 5-10 second daily check-in. Simple by design, not medicalised. If today
 * is already logged it shows the resulting readiness and lets you update it.
 */
export function CheckInCard({
  todayReadiness
}: {
  todayReadiness: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(todayReadiness === null);
  const [saving, setSaving] = useState(false);
  const [vals, setVals] = useState<Record<string, Scale>>({
    energy: 3,
    sleep: 3,
    soreness: 3,
    stress: 3
  });

  async function submit() {
    setSaving(true);
    const res = await checkInAction(vals);
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open && todayReadiness !== null) {
    return (
      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="eyebrow">Today&apos;s readiness</p>
          <p className="mt-2 text-sm text-bone-dim">
            {todayReadiness >= 66 ? "Good to push." : todayReadiness >= 45 ? "Steady. Train as planned." : "Low. WRECK will ease your load."}
          </p>
          <button onClick={() => setOpen(true)} className="mt-3 text-xs font-bold uppercase tracking-wide text-ember-hi">
            Update check-in
          </button>
        </div>
        <Ring value={todayReadiness} size={84} stroke={6}>
          <div className="text-center">
            <div className="font-display text-2xl text-bone">{todayReadiness}</div>
            <div className="text-[0.5rem] uppercase tracking-label text-bone-faint">ready</div>
          </div>
        </Ring>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <p className="eyebrow">Daily check-in</p>
      <p className="mt-1 text-sm text-bone-dim">Ten seconds. It shapes today&apos;s load.</p>
      <div className="mt-5 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="mb-1.5 flex justify-between">
              <span className="text-sm text-bone">{f.label}</span>
              <span className="text-sm text-bone-dim tabular-nums">{vals[f.key]} / 5</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${f.label} ${n}`}
                  onClick={() => setVals((v) => ({ ...v, [f.key]: n as Scale }))}
                  className={
                    "h-8 flex-1 rounded-sm border transition-colors duration-150 " +
                    (n <= vals[f.key]
                      ? "border-ember bg-ember/20"
                      : "border-ink-line bg-ink hover:border-bone/30")
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-5 w-full" onClick={submit} disabled={saving}>
        {saving ? "Saving" : "Log check-in"}
      </Button>
    </Card>
  );
}
