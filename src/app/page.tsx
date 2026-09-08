import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { ModeDemo } from "@/components/landing/mode-demo";
import { Button, Eyebrow } from "@/components/ui/primitives";
import { IconArrow, IconBarbell, IconBowl, IconColumns, IconPulse, IconShield, IconSpeech } from "@/components/icons";

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <DemoSection />
        <Pillars />
        <HowItWorks />
        <Trust />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-line">
      <div className="mx-auto max-w-shell px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <Eyebrow>Personalized fitness operating system</Eyebrow>
        <h1 className="mt-6 max-w-[16ch] font-display text-display-xl text-bone">
          Your fitness,
          <br />
          built around <span className="text-ember">you</span>.
        </h1>
        <p className="mt-7 max-w-prose text-lg leading-relaxed text-bone-dim">
          Not a generic workout generator. Not a chatbot. WRECK understands your goal, schedule,
          equipment, food culture, budget and recovery, builds a plan around all of it, and adapts
          when life gets in the way.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Build my WRECK
              <IconArrow size={18} />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              I have an account
            </Button>
          </Link>
        </div>

        {/* Honest supporting facts, set as editorial figures rather than badges */}
        <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
          <Figure term="8 training modes" desc="Beginner to sport performance, one platform." />
          <Figure term="Regional food" desc="Meals from the cuisine you actually eat." />
          <Figure term="Deterministic core" desc="Real math for calories and programming." />
        </dl>
      </div>
    </section>
  );
}

function Figure({ term, desc }: { term: string; desc: string }) {
  return (
    <div>
      <dt className="font-display text-display-md text-bone">{term}</dt>
      <dd className="mt-1 text-sm text-bone-dim">{desc}</dd>
    </div>
  );
}

function Problem() {
  return (
    <section className="border-b border-ink-line">
      <div className="mx-auto grid max-w-shell gap-10 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-5 font-display text-display-lg text-bone">Fitness is fragmented.</h2>
        </div>
        <div className="md:col-span-7">
          <p className="max-w-prose text-lg leading-relaxed text-bone-dim">
            One app writes a plan. Another tracks food. A third counts calories. None of them know
            each other, and none of them know you. So the plan ignores your schedule, the recipes
            ignore your kitchen, and the whole thing falls apart the first week you travel.
          </p>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-bone-dim">
            WRECK connects training, nutrition, recovery and progress around a single model of who
            you are. You open it and immediately know the next best action for your goal, why you
            are doing it, and what to do when today no longer fits.
          </p>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="border-b border-ink-line">
      <div className="mx-auto grid max-w-shell gap-12 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-4">
          <Eyebrow>See it adapt</Eyebrow>
          <h2 className="mt-5 font-display text-display-lg text-bone">
            One person changes everything.
          </h2>
          <p className="mt-6 max-w-prose text-bone-dim">
            Pick an identity and watch the same interface reconfigure. The navigation, the lead
            metric, today&apos;s action and the emphasis all change, because the plan is built from
            who you are, not from a template.
          </p>
        </div>
        <div className="md:col-span-8">
          <ModeDemo />
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      icon: IconBarbell,
      title: "A training engine, not a template",
      body: "Programs assembled from your days, session length, equipment and experience, with progression rules and substitutions built in. Rolling sessions so a missed day never derails the week."
    },
    {
      icon: IconBowl,
      title: "Nutrition that respects your kitchen",
      body: "Calorie and protein targets from real math, then meals from your regional cuisine, your diet and your budget. Family Food Mode keeps household meals and adjusts portions instead of banning them."
    },
    {
      icon: IconPulse,
      title: "Adaptation you can see",
      body: "Missed sessions, poor recovery, low protein and travel are signals. A rule-based engine decides what changes, records why, and lets you tap to see the inputs behind every adjustment."
    },
    {
      icon: IconSpeech,
      title: "A coach that explains, never invents",
      body: "The coach answers from your real profile, program and logs. It explains WRECK's decisions rather than inventing a second plan, and it never fabricates nutrition numbers."
    },
    {
      icon: IconColumns,
      title: "Progress that means something",
      body: "Metrics matched to your identity: strength trend, mileage, adherence, body weight, readiness. A timeline of the changes that actually mattered."
    }
  ];
  return (
    <section id="pillars" className="border-b border-ink-line">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <Eyebrow>What it does</Eyebrow>
          <h2 className="mt-5 font-display text-display-lg text-bone">
            Five systems, one model of you.
          </h2>
        </div>
        <ol className="mt-14">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <li
                key={it.title}
                className="grid gap-5 border-t border-ink-line py-8 md:grid-cols-12 md:gap-8 md:py-10"
              >
                <div className="flex items-center gap-4 md:col-span-4">
                  <span className="font-display text-display-md text-bone-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-ember">
                    <Icon size={26} />
                  </span>
                </div>
                <h3 className="font-display text-display-md text-bone md:col-span-4">{it.title}</h3>
                <p className="max-w-prose text-bone-dim md:col-span-4">{it.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Understand", "A short, branching onboarding builds your profile: goal, identity, constraints, food culture and recovery."],
    ["Plan", "A deterministic engine turns that profile into your mode, dashboard, training block and nutrition targets."],
    ["Execute", "Open the app and see one clear action for today, with everything you need to do it well."],
    ["Measure", "Log workouts and meals in a tap. Check in on energy, sleep, soreness and stress in seconds."],
    ["Learn", "WRECK watches the signals: what you completed, how you recovered, how eating went."],
    ["Adapt", "The plan changes when reality changes, and always tells you why."]
  ];
  return (
    <section id="how" className="border-b border-ink-line">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 font-display text-display-lg text-bone">
            Understand. Plan. Execute. Adapt.
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([title, body], i) => (
            <div key={title} className="bg-ink-raise p-7">
              <span className="font-display text-display-md text-ember tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-display-md text-bone">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bone-dim">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const rows = [
    ["Deterministic core", "Calories, macros and programming come from real, testable rules. AI never invents these numbers."],
    ["AI within boundaries", "The coach explains your plan and answers from your data. It escalates medical and injury questions to professionals."],
    ["Private by default", "Body metrics and progress photos are private. You can export or delete your data at any time."],
    ["Honest about uncertainty", "Targets are starting estimates that adapt from your real trend. WRECK shows the basis, not false confidence."]
  ];
  return (
    <section id="trust">
      <div className="mx-auto grid max-w-shell gap-12 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-4">
          <span className="text-ember">
            <IconShield size={30} />
          </span>
          <h2 className="mt-5 font-display text-display-lg text-bone">Built to be trusted.</h2>
          <p className="mt-5 max-w-prose text-bone-dim">
            Premium design should improve clarity and motivation, never mask weak substance. WRECK
            is a real product with real safeguards.
          </p>
        </div>
        <dl className="md:col-span-8">
          {rows.map(([term, desc]) => (
            <div key={term} className="grid gap-2 border-t border-ink-line py-6 md:grid-cols-3 md:gap-8">
              <dt className="font-display text-display-md text-bone md:col-span-1">{term}</dt>
              <dd className="max-w-prose text-bone-dim md:col-span-2">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-ink-line">
      <div className="mx-auto max-w-shell px-5 py-24 text-center md:px-8 md:py-32">
        <h2 className="mx-auto max-w-[18ch] font-display text-display-xl text-bone">
          Stop asking what to do. Open WRECK and know.
        </h2>
        <div className="mt-10 flex justify-center">
          <Link href="/register">
            <Button size="lg">
              Build my WRECK
              <IconArrow size={18} />
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-bone-faint">Free to start. No card required.</p>
      </div>
    </section>
  );
}
