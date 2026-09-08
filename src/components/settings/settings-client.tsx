"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountDataAction, exportDataAction, saveSettingsAction } from "@/app/actions";
import type { UserSettings } from "@/domain/types";
import { Button, Card } from "@/components/ui/primitives";

export function SettingsClient({ initial }: { initial: UserSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(initial);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function toggle(key: keyof UserSettings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setSaved(false);
    const res = await saveSettingsAction(next);
    if (res.ok) {
      setSaved(true);
      if (key === "reducedMotion") router.refresh();
    }
  }

  async function exportData() {
    const res = await exportDataAction();
    if (!res.ok || !res.data) return;
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wreck-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function wipe() {
    await deleteAccountDataAction();
    router.push("/app/onboarding");
    router.refresh();
  }

  const toggles: { key: keyof UserSettings; label: string; desc: string }[] = [
    { key: "reducedMotion", label: "Reduce motion", desc: "Minimise animations across the app." },
    { key: "photosPrivate", label: "Keep progress photos private", desc: "Photos and body data stay private to you. Recommended on." },
    { key: "notifyTraining", label: "Training reminders", desc: "A nudge for today's session." },
    { key: "notifyNutrition", label: "Nutrition reminders", desc: "A nudge to log meals." }
  ];

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow mb-3">Preferences</p>
        <Card className="divide-y divide-ink-line">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm text-bone">{t.label}</p>
                <p className="text-xs text-bone-faint">{t.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={settings[t.key]}
                aria-label={t.label}
                onClick={() => toggle(t.key)}
                className={
                  "relative h-6 w-11 shrink-0 rounded-full border transition-colors " +
                  (settings[t.key] ? "border-ember bg-ember/30" : "border-ink-line bg-ink")
                }
              >
                <span
                  className={
                    "absolute top-0.5 h-4 w-4 rounded-full transition-all " +
                    (settings[t.key] ? "left-[22px] bg-ember" : "left-0.5 bg-bone-faint")
                  }
                />
              </button>
            </div>
          ))}
        </Card>
        {saved && <p className="mt-2 text-xs text-moss">Saved.</p>}
      </section>

      <section>
        <p className="eyebrow mb-3">Your data</p>
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-bone">Export your data</p>
              <p className="text-xs text-bone-faint">Download everything WRECK stores about you as JSON.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={exportData}>
              Export
            </Button>
          </div>
          <div className="rule" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-bone">Reset plan and data</p>
              <p className="text-xs text-bone-faint">
                Deletes your profile, program and logs, then restarts onboarding. This cannot be undone.
              </p>
            </div>
            {confirming ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={wipe}>
                  Confirm delete
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
                Reset
              </Button>
            )}
          </div>
        </Card>
      </section>

      <section>
        <p className="eyebrow mb-3">Subscription</p>
        <Card className="p-5">
          <p className="text-sm text-bone">Free core</p>
          <p className="mt-1 text-sm text-bone-dim">
            The core WRECK experience is free. Paid plans for advanced coaching and richer media are
            planned. You will always be able to export and delete your data.
          </p>
        </Card>
      </section>

      <section>
        <p className="eyebrow mb-3">Safety</p>
        <Card className="p-5">
          <p className="text-sm leading-relaxed text-bone-dim">
            WRECK provides educational fitness and nutrition guidance, not medical advice. Its
            numbers are starting estimates. Stop and consult a qualified professional if you feel
            pain, dizziness or other warning signs, or before starting if you have an injury or
            medical condition. Supplement information is educational and food-first.
          </p>
        </Card>
      </section>
    </div>
  );
}
