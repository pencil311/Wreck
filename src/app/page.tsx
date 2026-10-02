import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { ModeDemo } from "@/components/landing/mode-demo";
import { Preloader } from "@/components/landing/preloader";
import { HeroParallax } from "@/components/landing/acts/hero-parallax";
import { Fragmented } from "@/components/landing/acts/fragmented";
import { Reforge } from "@/components/landing/acts/reforge";
import { MacroScrub } from "@/components/landing/acts/macro-scrub";
import { ModesPan } from "@/components/landing/acts/modes-pan";
import { Reveal, RevealGroup, RevealItem, MagneticNav, TiltCard } from "@/components/landing/motion";
import { CircleScribble } from "@/components/landing/doodles";
import { buttonClass } from "@/components/ui/primitives";
import { IconArrow } from "@/components/icons";

const FRAME_INK = "border-2 border-ink shadow-[10px_10px_0_0_#001621]";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-sand text-ink">
      <Preloader />
      <SiteHeader />
      <main>
        <HeroParallax />
        <Fragmented />
        <Reforge />
        <DemoSection />
        <MacroScrub />
        <ModesPan />
        <Trust />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

/* Live proof — the fused plan, running. Follows the Reforge payoff. */
function DemoSection() {
  return (
    <section id="demo" className="border-b-2 border-ink bg-sand-deep">
      <div className="mx-auto grid max-w-shell gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="font-serif text-xl italic text-ink/50">See it adapt</p>
            <h2 className="mt-3 font-display text-display-lg text-ink">ONE PERSON CHANGES EVERYTHING.</h2>
            <p className="mt-6 max-w-prose text-ink/70">
              Pick an identity and watch the same interface reconfigure. Navigation, the lead metric,
              today&apos;s action and the emphasis all change, because the plan is built from who you are.
            </p>
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <Reveal delay={0.1}>
            <TiltCard max={4}>
              <div className={`overflow-hidden rounded-sm ${FRAME_INK}`}>
                <ModeDemo />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const rows: [string, string][] = [
    ["Deterministic core", "Calories, macros and programming come from real, testable rules. AI never invents these numbers."],
    ["AI within boundaries", "The coach explains your plan and answers from your data. It escalates medical and injury questions to professionals."],
    ["Private by default", "Body metrics and progress photos are private. You can export or delete your data at any time."],
    ["Honest about uncertainty", "Targets are starting estimates that adapt from your real trend. WRECK shows the basis, not false confidence."]
  ];
  return (
    <section id="trust" className="border-b-2 border-ink">
      <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <h2 className="max-w-2xl font-display text-display-lg text-ink">BUILT TO BE TRUSTED.</h2>
        </Reveal>
        <RevealGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {rows.map(([term, desc]) => (
            <RevealItem key={term}>
              <div className={`h-full rounded-sm bg-sand-deep p-7 ${FRAME_INK}`}>
                <h3 className="font-display text-display-md text-ink">{term}</h3>
                <p className="mt-3 text-ink/70">{desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-ember">
      <div className="mx-auto max-w-shell px-5 py-28 text-center md:px-8 md:py-40">
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.88] text-ink">
            STOP ASKING WHAT TO DO.{" "}
            <span className="relative inline-block">
              OPEN WRECK
              <CircleScribble className="absolute -inset-x-8 -inset-y-5 h-[calc(100%+2.5rem)] w-[calc(100%+4rem)] [&_path]:!stroke-ink" />
            </span>{" "}
            AND KNOW.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-12 flex justify-center">
            <MagneticNav
              href="/register"
              linkClassName={buttonClass("outline", "lg", "shadow-[6px_6px_0_0_#001621] hover:shadow-[3px_3px_0_0_#001621]")}
            >
              Build my WRECK
              <IconArrow size={18} />
            </MagneticNav>
          </div>
          <p className="mt-6 text-sm font-bold text-ink/70">Free to start. No card required.</p>
        </Reveal>
      </div>
    </section>
  );
}
