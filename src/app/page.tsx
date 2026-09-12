import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { ModeDemo } from "@/components/landing/mode-demo";
import { Button, Eyebrow } from "@/components/ui/primitives";
import { Magnetic } from "@/components/motion/magnetic";
import { TiltCard } from "@/components/motion/tilt-card";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { Marquee } from "@/components/motion/marquee";
import { Counter } from "@/components/motion/counter";
import { SpotlightText } from "@/components/motion/spotlight-text";
import { AreaTrend, BarSeries, RingStat } from "@/components/charts/wreck-charts";
import {
  DumbbellMark,
  IconArrow,
  IconBowl,
  IconColumns,
  IconPulse,
  IconShield,
  IconSpeech
} from "@/components/icons";
import { FOODS } from "@/domain/nutrition/foods";
import { EXERCISES } from "@/domain/training/exercises";
import { MODES } from "@/domain/types";

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main>
        <Hero />
        <ModeMarquee />
        <Problem />
        <DemoSection />
        <ProgressShowcase />
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
  const trend = [88, 91, 90, 96, 99, 97, 104, 109, 113, 118];
  return (
    <section className="relative overflow-hidden border-b border-ink-line">
      {/* Aurora ambiance — a single drifting ember light, no orbs, no dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[15%] -top-[30%] h-[60vh] w-[60vw] rounded-full opacity-70 blur-[90px]"
        style={{
          background: "radial-gradient(circle, rgba(216,97,58,0.16), transparent 62%)",
          animation: "aurora 18s ease-in-out infinite"
        }}
      />
      <div className="relative mx-auto grid max-w-shell gap-12 px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow>Personalized fitness operating system</Eyebrow>
          </Reveal>
          <SpotlightText className="mt-6">
            <h1 className="max-w-[15ch] font-display text-display-xl leading-[0.95]">
              Your fitness,
              <br />
              built around you.
            </h1>
          </SpotlightText>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-prose text-lg leading-relaxed text-bone-dim">
              Not a generic workout generator. Not a chatbot. WRECK understands your goal, schedule,
              equipment, food culture, budget and recovery, builds a plan around all of it, and
              adapts when life gets in the way.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link href="/register">
                  <Button size="lg">
                    Build my WRECK
                    <IconArrow size={18} />
                  </Button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    I have an account
                  </Button>
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-x-8 gap-y-8">
            <Figure n={MODES.length} label="training modes, one platform" />
            <Figure n={FOODS.length} label="regional foods, real macros" />
            <Figure n={EXERCISES.length} label="exercises, equipment-aware" />
          </dl>
        </div>

        {/* Hero chart card — tilts to the cursor, gradient edge, corner brackets */}
        <div className="lg:col-span-5">
          <Reveal delay={0.12}>
            <TiltCard className="h-full">
              <div className="brackets edge relative rounded-md bg-ink-raise p-6">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Strength trend</p>
                  <span className="text-xs text-moss">+34% / 12 wks</span>
                </div>
                <div className="mt-4">
                  <span className="font-display text-metric text-bone">
                    <Counter value={118} suffix=" kg" />
                  </span>
                  <p className="eyebrow mt-1">Estimated squat 1RM</p>
                </div>
                <AreaTrend data={trend} height={150} className="mt-4" />
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-line pt-4">
                  <MiniStat label="Adherence" value="92%" />
                  <MiniStat label="Protein" value="1.9 g/kg" />
                  <MiniStat label="Readiness" value="78" />
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Figure({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <dt className="font-display text-display-md text-bone">
        <Counter value={n} />
      </dt>
      <dd className="mt-1 text-sm text-bone-dim">{label}</dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-lg text-bone">{value}</p>
      <p className="text-[0.625rem] uppercase tracking-label text-bone-faint">{label}</p>
    </div>
  );
}

function ModeMarquee() {
  const words = [
    "Bodybuilding",
    "Strength",
    "Running",
    "Sport performance",
    "Calisthenics",
    "Hybrid",
    "General fitness",
    "Beginner"
  ];
  return (
    <div className="border-b border-ink-line py-5">
      <Marquee duration={34}>
        {words.map((w) => (
          <span key={w} className="flex items-center gap-8">
            <span className="font-display text-display-md text-bone-faint">{w}</span>
            <span className="text-ember">/</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}

function Problem() {
  return (
    <section className="border-b border-ink-line">
      <div className="mx-auto grid max-w-shell gap-10 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <h2 className="mt-5 font-display text-display-lg text-bone">Fitness is fragmented.</h2>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={0.1}>
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
          </Reveal>
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
          <Reveal>
            <Eyebrow>See it adapt</Eyebrow>
            <h2 className="mt-5 font-display text-display-lg text-bone">One person changes everything.</h2>
            <p className="mt-6 max-w-prose text-bone-dim">
              Pick an identity and watch the same interface reconfigure. Navigation, the lead metric,
              today&apos;s action and the chart all change, because the plan is built from who you
              are, not from a template.
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-8">
          <Reveal delay={0.1}>
            <ModeDemo />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProgressShowcase() {
  const adherence = [60, 72, 68, 80, 88, 84, 92];
  const volume = [8, 11, 9, 13, 12, 14, 16, 15, 18];
  return (
    <section className="border-b border-ink-line">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Progress you can feel</Eyebrow>
            <h2 className="mt-5 font-display text-display-lg text-bone">
              The numbers move, and you see why.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal>
            <TiltCard>
              <div className="edge flex h-full flex-col items-center justify-center rounded-md bg-ink-raise p-8">
                <RingStat value={78} label="Readiness today" />
                <p className="mt-5 text-center text-sm text-bone-dim">
                  A ten second check-in gates your load so hard days land when you can take them.
                </p>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.08}>
            <TiltCard>
              <div className="edge h-full rounded-md bg-ink-raise p-6">
                <p className="eyebrow">Protein adherence</p>
                <p className="mt-2 font-display text-metric text-bone">
                  <Counter value={92} suffix="%" />
                </p>
                <p className="eyebrow mt-1">Last 7 logged days</p>
                <AreaTrend data={adherence} height={120} className="mt-4" />
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.16}>
            <TiltCard>
              <div className="edge h-full rounded-md bg-ink-raise p-6">
                <p className="eyebrow">Weekly training volume</p>
                <p className="mt-2 font-display text-metric text-bone">
                  <Counter value={18} />
                </p>
                <p className="eyebrow mt-1">Hard sets, trending up</p>
                <BarSeries data={volume} height={128} className="mt-6" />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      mark: "dumbbell" as const,
      title: "A training engine, not a template",
      body: "Programs assembled from your days, session length, equipment and experience, with progression and substitutions built in. Rolling sessions so a missed day never derails the week."
    },
    {
      icon: IconBowl,
      title: "Nutrition that respects your kitchen",
      body: "Calorie and protein targets from real math, then meals from your regional cuisine, your diet and your budget. Family Food Mode adjusts portions instead of banning your household meals."
    },
    {
      icon: IconPulse,
      title: "Adaptation you can see",
      body: "Missed sessions, poor recovery, low protein and travel are signals. A rule-based engine decides what changes, records why, and lets you tap to see the inputs behind every adjustment."
    },
    {
      icon: IconSpeech,
      title: "A coach that explains, never invents",
      body: "The coach answers from your real profile, program and logs. It explains WRECK's decisions rather than inventing a second plan, and never fabricates nutrition numbers."
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
          <Reveal>
            <Eyebrow>What it does</Eyebrow>
            <h2 className="mt-5 font-display text-display-lg text-bone">Five systems, one model of you.</h2>
          </Reveal>
        </div>
        <StaggerList className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const Icon = "icon" in it ? it.icon : null;
            return (
              <StaggerItem key={it.title}>
                <TiltCard className="h-full">
                  <div className="brackets edge h-full rounded-md bg-ink-raise p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-display-md text-bone-faint tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {it.mark === "dumbbell" ? (
                        <DumbbellMark size={42} />
                      ) : Icon ? (
                        <span className="text-ember">
                          <Icon size={26} />
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-6 font-display text-display-md text-bone">{it.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-bone-dim">{it.body}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerList>
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
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-5 font-display text-display-lg text-bone">Understand. Plan. Execute. Adapt.</h2>
          </Reveal>
        </div>
        <StaggerList className="mt-14 grid gap-px overflow-hidden rounded-md border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([title, body], i) => (
            <StaggerItem key={title} className="bg-ink-raise">
              <div className="group h-full p-7 transition-colors duration-200 hover:bg-ink-raise2">
                <span className="font-display text-display-md text-ember tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-display-md text-bone">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bone-dim">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
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
          <Reveal>
            <span className="text-ember">
              <IconShield size={30} />
            </span>
            <h2 className="mt-5 font-display text-display-lg text-bone">Built to be trusted.</h2>
            <p className="mt-5 max-w-prose text-bone-dim">
              Premium design should improve clarity and motivation, never mask weak substance. WRECK
              is a real product with real safeguards.
            </p>
          </Reveal>
        </div>
        <dl className="md:col-span-8">
          {rows.map(([term, desc], i) => (
            <Reveal key={term} delay={i * 0.05} as="div">
              <div className="grid gap-2 border-t border-ink-line py-6 md:grid-cols-3 md:gap-8">
                <dt className="font-display text-display-md text-bone md:col-span-1">{term}</dt>
                <dd className="max-w-prose text-bone-dim md:col-span-2">{desc}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-ink-line">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(216,97,58,0.14), transparent 65%)", animation: "aurora 20s ease-in-out infinite" }}
      />
      <div className="relative mx-auto max-w-shell px-5 py-24 text-center md:px-8 md:py-32">
        <SpotlightText radius={240} className="mx-auto max-w-[18ch]">
          <h2 className="font-display text-display-xl">Stop asking what to do. Open WRECK and know.</h2>
        </SpotlightText>
        <div className="mt-10 flex justify-center">
          <Magnetic>
            <Link href="/register">
              <Button size="lg">
                Build my WRECK
                <IconArrow size={18} />
              </Button>
            </Link>
          </Magnetic>
        </div>
        <p className="mt-6 text-sm text-bone-faint">Free to start. No card required.</p>
      </div>
    </section>
  );
}
