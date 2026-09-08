import type { Metadata } from "next";
import { getViewer } from "@/lib/data";
import { Page, PageHeader } from "@/components/app/page-header";
import { CoachClient } from "@/components/coach/coach-client";

export const metadata: Metadata = { title: "Coach" };

export default async function CoachPage() {
  const { user, data } = await getViewer();
  const first = data.program?.weeks[0]?.workouts[0];
  const greeting = `Hi ${user.displayName}. I am your WRECK coach. ${
    first ? `Today's session is ${first.label}. ` : ""
  }Ask me anything about your plan, or tap a quick action below.`;

  return (
    <Page>
      <PageHeader eyebrow="Coach" title="Talk it through" />
      <div className="mt-8">
        <CoachClient greeting={greeting} />
      </div>
    </Page>
  );
}
