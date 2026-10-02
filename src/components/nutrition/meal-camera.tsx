"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/primitives";
import { IconCamera, IconClose } from "@/components/icons";

/**
 * Full-screen meal capture. Live viewfinder with multi-shot, retake and a
 * file-input fallback when the camera is unavailable. Photos are compressed on
 * the client before upload. On Analyse it POSTs to /api/food-scan and hands the
 * result up; the parent opens the review sheet. The camera stream is always
 * stopped on close/unmount so the webcam light goes off.
 */

const MAX_PHOTOS = 6;

export type ScanResult = {
  photoIds: string[];
  items: unknown[];
  source: "photo" | "manual";
  error?: string;
  note: string;
};

type Shot = { url: string; blob: Blob };

async function compress(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82);
  });
}

export function MealCamera({
  onClose,
  onAnalysed
}: {
  onClose: () => void;
  onAnalysed: (result: ScanResult) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [camError, setCamError] = useState<string | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setCamError("Camera unavailable. Choose a photo instead.");
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  async function capture() {
    const video = videoRef.current;
    if (!video || shots.length >= MAX_PHOTOS) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
    if (!blob) return;
    const small = await compress(blob);
    setShots((s) => [...s, { url: URL.createObjectURL(small), blob: small }]);
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - shots.length;
    const picked = Array.from(files).slice(0, room);
    const next: Shot[] = [];
    for (const f of picked) {
      const small = await compress(f);
      next.push({ url: URL.createObjectURL(small), blob: small });
    }
    setShots((s) => [...s, ...next]);
  }

  function removeAt(i: number) {
    setShots((s) => {
      URL.revokeObjectURL(s[i]?.url);
      return s.filter((_, idx) => idx !== i);
    });
    setPreview(null);
  }

  function retakeAt(i: number) {
    removeAt(i); // drop it and return to the viewfinder to shoot again
  }

  async function analyse() {
    if (shots.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      shots.forEach((s, i) => fd.append("images", s.blob, `meal-${i}.jpg`));
      if (note.trim()) fd.append("note", note.trim());
      const res = await fetch("/api/food-scan", { method: "POST", body: fd });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Analysis failed.");
      }
      const data = (await res.json()) as Omit<ScanResult, "note">;
      stopStream();
      onAnalysed({ ...data, note: note.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  function close() {
    stopStream();
    shots.forEach((s) => URL.revokeObjectURL(s.url));
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
      role="dialog"
      aria-label="Snap a meal"
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-display text-display-md text-bone">Snap a meal</p>
          <button onClick={close} aria-label="Close" className="text-bone-dim hover:text-bone">
            <IconClose size={24} />
          </button>
        </div>

        {/* viewfinder / preview */}
        <div className="relative flex-1 overflow-hidden bg-ink-raise">
          {preview !== null ? (
            <div className="absolute inset-0 flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shots[preview]?.url} alt="" className="min-h-0 flex-1 object-contain" />
              <div className="flex gap-2 p-3">
                <Button variant="secondary" className="flex-1" onClick={() => retakeAt(preview)}>
                  Retake
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => removeAt(preview)}>
                  Remove
                </Button>
                <Button className="flex-1" onClick={() => setPreview(null)}>
                  Done
                </Button>
              </div>
            </div>
          ) : camError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <IconCamera size={40} />
              <p className="text-bone-dim">{camError}</p>
              <Button onClick={() => fileRef.current?.click()}>Choose a photo</Button>
            </div>
          ) : (
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          )}
        </div>

        {/* thumbnail strip */}
        {shots.length > 0 && preview === null && (
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 no-scrollbar">
            {shots.map((s, i) => (
              <button
                key={s.url}
                onClick={() => setPreview(i)}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-ink-line"
                aria-label={`Photo ${i + 1}, tap to review`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            <span className="ml-1 shrink-0 text-xs text-bone-faint tabular-nums">
              {shots.length} / {MAX_PHOTOS}
            </span>
          </div>
        )}

        {error && (
          <p className="px-4 pb-1 text-sm text-clay" role="alert">
            {error}
          </p>
        )}

        {/* controls */}
        {preview === null && (
          <div className="px-4 pb-4 pt-1">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything we can't see? (e.g. cooked in ghee)"
              maxLength={200}
              className="mb-3 w-full rounded-sm border border-ink-line bg-ink px-3 py-2 text-sm text-bone"
            />
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (fileRef.current) fileRef.current.removeAttribute("capture");
                  fileRef.current?.click();
                }}
                className="text-sm font-bold uppercase tracking-wide text-bone-dim hover:text-bone"
              >
                Gallery
              </button>
              {!camError && (
                <button
                  onClick={capture}
                  disabled={shots.length >= MAX_PHOTOS}
                  aria-label="Take photo"
                  className="h-16 w-16 rounded-full border-4 border-bone bg-bone/20 disabled:opacity-40"
                />
              )}
              <Button onClick={analyse} disabled={shots.length === 0 || busy}>
                {busy ? "Analysing" : "Analyse"}
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          // `capture` is set only for the camera-fallback button, not Gallery.
          multiple
          hidden
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
