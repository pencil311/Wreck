import type { Config } from "tailwindcss";

/**
 * WRECK design language.
 *
 * Deliberate anti-"vibecoded" decisions baked into the tokens:
 *  - No pure #fff / #000. Warm near-black ground, bone foreground.
 *  - One restrained accent (ember), never neon, never purple, never pastel.
 *  - Sharp geometry. Radius tops out around 4px; most surfaces are square.
 *  - Hairline borders instead of soft drop shadows for surface separation.
 *  - Type pairing: Epic Pro (display) + Arial (text). No Inter/Geist/Space Grotesk.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Grounds
        ink: {
          DEFAULT: "#0B0B0C", // page ground, warm near-black
          raise: "#131315", // elevated surface
          raise2: "#1A1A1D", // second elevation
          line: "#26262A" // hairline border on dark
        },
        // Foreground
        bone: {
          DEFAULT: "#EDE9E1", // primary text, warm off-white (never #fff)
          dim: "#9B978E", // secondary text
          faint: "#66635C" // tertiary / captions
        },
        // Single accent — molten ember, desaturated so it reads premium not neon
        ember: {
          DEFAULT: "#D8613A",
          hi: "#E8794F",
          lo: "#A9421F"
        },
        // Utility signals kept muted and editorial
        moss: "#7E8B5A", // positive / on-track (not a neon green)
        clay: "#C6503E", // caution / behind
        paper: "#EDE9E1" // light surfaces use bone, never pure white
      },
      fontFamily: {
        display: ['"Epic Pro"', '"Arial Black"', "Arial", "sans-serif"],
        sans: ["Arial", '"Helvetica Neue"', "Helvetica", "sans-serif"]
      },
      fontSize: {
        // Editorial scale — large, confident display sizes with tight leading
        "display-2xl": ["clamp(3.5rem, 9vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        "display-xl": ["clamp(2.75rem, 6vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 2.5vw, 2rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "metric": ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }]
      },
      borderRadius: {
        // Sharp by default. This intentionally caps soft rounding.
        none: "0px",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "4px",
        xl: "4px",
        full: "9999px" // reserved for genuine pills (chips, avatars)
      },
      letterSpacing: {
        label: "0.14em",
        wide: "0.06em"
      },
      maxWidth: {
        shell: "1240px",
        prose: "62ch"
      },
      transitionTimingFunction: {
        // A single, purposeful curve. No bouncy overshoot.
        wreck: "cubic-bezier(0.22, 0.61, 0.36, 1)"
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "bar-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" }
        },
        "sweep": {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        "rise-in": "rise-in 0.6s var(--ease-wreck) both",
        "fade-in": "fade-in 0.5s var(--ease-wreck) both",
        "bar-grow": "bar-grow 0.9s var(--ease-wreck) both",
        sweep: "sweep 1.4s infinite"
      }
    }
  },
  plugins: []
};

export default config;
