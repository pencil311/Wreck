import type { Metadata } from "next";
import { getViewer } from "@/lib/data";
import { Page, PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Learn" };

const LESSONS = [
  {
    title: "Progress comes from showing up",
    body: "The single biggest predictor of results is consistency. A simple plan you follow beats a perfect plan you abandon. Aim to complete your sessions, not to make each one maximal."
  },
  {
    title: "Form before load",
    body: "Learn the movement well before adding weight. Good technique keeps you training without setbacks, which is what actually drives progress over months."
  },
  {
    title: "Protein is the priority nutrient",
    body: "For most goals, hitting your protein target matters more than the exact split of the rest. Build meals around a protein source you enjoy and will eat repeatedly."
  },
  {
    title: "Recovery is part of training",
    body: "Muscle and fitness are built between sessions, not during them. Sleep, food and lighter days are not the opposite of progress; they are how it happens."
  },
  {
    title: "Supplements are food-first",
    body: "Creatine and protein powder are convenient, not magic. Cover the basics with food first. Treat any supplement as optional, and be cautious with anything promising quick results."
  }
];

export default async function LearnPage() {
  // Ensures auth/profile gating via the shell layout; viewer is not otherwise needed.
  await getViewer();
  return (
    <Page>
      <PageHeader eyebrow="Learn" title="The basics, briefly" />
      <div className="mt-8 space-y-4">
        {LESSONS.map((l, i) => (
          <Card key={l.title} className="p-5">
            <div className="flex items-start gap-4">
              <span className="font-display text-display-md text-bone-faint tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-lg text-bone">{l.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-bone-dim">{l.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
