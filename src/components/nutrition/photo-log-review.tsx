"use client";

import { useMemo, useState } from "react";
import { discardPhotosAction, logPhotoMealAction } from "@/app/actions";
import { Button, Card, Tag } from "@/components/ui/primitives";
import { IconClose } from "@/components/icons";
import type { PhotoLogItem } from "@/domain/types";
import type { ScanResult } from "./meal-camera";

type Meal = "breakfast" | "lunch" | "dinner" | "snack";
const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

function defaultMeal(): Meal {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}

function blankItem(): PhotoLogItem {
  return { name: "", portion: "", kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, origin: "user_edited" };
}

export function PhotoLogReview({
  data,
  onClose,
  onLogged,
  onBackToPhotos
}: {
  data: ScanResult;
  onClose: () => void;
  onLogged: () => void;
  onBackToPhotos: () => void;
}) {
  const initial = (data.items as PhotoLogItem[]) ?? [];
  const [items, setItems] = useState<PhotoLogItem[]>(initial.length ? initial : [blankItem()]);
  const [meal, setMeal] = useState<Meal>(defaultMeal());
  const [name, setName] = useState(
    initial.length ? initial.slice(0, 2).map((i) => i.name).filter(Boolean).join(" + ") : ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(data.error ?? null);

  const totals = useMemo(
    () =>
      items.reduce(
        (a, i) => ({
          kcal: a.kcal + (i.kcal || 0),
          proteinG: a.proteinG + (i.proteinG || 0),
          carbsG: a.carbsG + (i.carbsG || 0),
          fatG: a.fatG + (i.fatG || 0)
        }),
        { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
      ),
    [items]
  );

  function patch(i: number, field: keyof PhotoLogItem, value: string) {
    setItems((list) =>
      list.map((it, idx) => {
        if (idx !== i) return it;
        const num = ["kcal", "proteinG", "carbsG", "fatG"].includes(field);
        return {
          ...it,
          [field]: num ? Number(value) || 0 : value,
          origin: "user_edited" // any edit marks it as the user's number
        };
      })
    );
  }

  async function discardAndClose() {
    if (data.photoIds.length) await discardPhotosAction(data.photoIds).catch(() => {});
    onClose();
  }

  async function back() {
    if (data.photoIds.length) await discardPhotosAction(data.photoIds).catch(() => {});
    onBackToPhotos();
  }

  async function log() {
    setBusy(true);
    setError(null);
    const clean = items.filter((i) => i.name.trim());
    if (clean.length === 0) {
      setError("Add at least one item.");
      setBusy(false);
      return;
    }
    const res = await logPhotoMealAction({
      foodName: name.trim() || clean[0].name,
      meal,
      photoIds: data.photoIds,
      items: clean,
      note: data.note || undefined
    });
    if (res.ok) {
      onLogged();
    } else {
      setError(res.error);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink" role="dialog" aria-label="Review meal">
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-display-md text-bone">Review meal</p>
          <button onClick={discardAndClose} aria-label="Close" className="text-bone-dim hover:text-bone">
            <IconClose size={24} />
          </button>
        </div>

        {/* photo strip */}
        {data.photoIds.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
            {data.photoIds.map((id) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={id}
                src={`/api/food-photos/${id}`}
                alt=""
                className="h-24 w-24 shrink-0 rounded-sm border border-ink-line object-cover"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="mb-3 rounded-sm border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">
            {error}
          </p>
        )}

        {/* name + meal */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meal name (e.g. Biryani + raita)"
          maxLength={80}
          className="mb-2 w-full rounded-sm border border-ink-line bg-ink px-3 py-2.5 text-bone"
        />
        <div className="mb-4 flex gap-2">
          {MEALS.map((m) => (
            <button
              key={m}
              onClick={() => setMeal(m)}
              className={`flex-1 rounded-sm border px-2 py-2.5 text-xs font-bold uppercase tracking-wide capitalize ${
                meal === m ? "border-ember text-ember" : "border-ink-line text-bone-faint"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* items */}
        <div className="space-y-3">
          {items.map((it, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <input
                  value={it.name}
                  onChange={(e) => patch(i, "name", e.target.value)}
                  placeholder="Item name"
                  className="min-w-0 flex-1 bg-transparent text-sm text-bone outline-none"
                />
                <button
                  onClick={() => setItems((l) => l.filter((_, idx) => idx !== i))}
                  aria-label="Remove item"
                  className="text-bone-faint hover:text-clay"
                >
                  <IconClose size={16} />
                </button>
              </div>
              <input
                value={it.portion}
                onChange={(e) => patch(i, "portion", e.target.value)}
                placeholder="Portion (e.g. 1 plate ~350 g)"
                className="mt-1 w-full bg-transparent text-xs text-bone-faint outline-none"
              />
              <div className="mt-3 grid grid-cols-4 gap-2">
                {(["kcal", "proteinG", "carbsG", "fatG"] as const).map((f) => (
                  <label key={f} className="block">
                    <span className="text-[0.625rem] uppercase tracking-wide text-bone-faint">
                      {f === "kcal" ? "kcal" : f === "proteinG" ? "P" : f === "carbsG" ? "C" : "F"}
                    </span>
                    <input
                      inputMode="decimal"
                      value={String(it[f] ?? 0)}
                      onChange={(e) => patch(i, f, e.target.value)}
                      className="mt-1 w-full rounded-sm border border-ink-line bg-ink px-2 py-2.5 text-sm text-bone"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {it.origin === "database" ? (
                  <Tag>WRECK database</Tag>
                ) : it.origin === "web_estimate" ? (
                  <Tag tone="ember">
                    Web estimate{it.confidence ? ` · ${it.confidence} confidence` : ""}
                  </Tag>
                ) : (
                  <Tag>Your entry</Tag>
                )}
                {it.sources?.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ember-hi underline"
                  >
                    {s.title || "source"}
                  </a>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <button
          onClick={() => setItems((l) => [...l, blankItem()])}
          className="mt-3 text-sm font-bold uppercase tracking-wide text-ember-hi"
        >
          Add item
        </button>
      </div>

      {/* sticky footer: totals + actions */}
      <div className="fixed inset-x-0 bottom-0 border-t border-ink-line bg-ink/95 backdrop-blur-[2px]">
        <div className="mx-auto w-full max-w-md px-4 py-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-display text-metric text-bone tabular-nums">{Math.round(totals.kcal)}</span>
            <span className="text-bone-dim tabular-nums">
              {Math.round(totals.proteinG)} P · {Math.round(totals.carbsG)} C · {Math.round(totals.fatG)} F
            </span>
          </div>
          <p className="mt-1 text-xs text-bone-faint">
            Estimates from your photo. Check them, they adapt from your real trend.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={back}>
              Back to photos
            </Button>
            <Button className="flex-1" onClick={log} disabled={busy}>
              {busy ? "Logging" : "Log meal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
