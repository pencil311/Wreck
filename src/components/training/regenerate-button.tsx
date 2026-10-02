"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { regenerateProgramAction } from "@/app/actions";
import { Button } from "@/components/ui/primitives";

export function RegenerateButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await regenerateProgramAction();
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "Rebuilding" : "Rebuild program"}
    </Button>
  );
}
