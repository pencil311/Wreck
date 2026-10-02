import type { Config } from "tailwindcss";

/**
 * WRECK design language.
 *
 * Deliberate anti-"vibecoded" decisions baked into the tokens:
 *  - No pure #fff / #000. Noturno (deep teal-black) ground, cool bone foreground.
 *  - One restrained accent (ember = Vulcanico #FF4103), never purple, never pastel.
 *  - Sharp geometry. Radius tops out around 4px; most surfaces are square.
 *  - Hairline borders instead of soft drop shadows for surface separation.
 *  - Type pairing: American Captain (display) + Gloucester MT (serif accent) + Arial (text).
 *
 * Palette source — "Combo 09":
 *   Vulcanico #FF4103   Noturno #001621
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Grounds — built up from Noturno #001621
        ink: {
          DEFAULT: "#001621", // page ground, Noturno deep teal-black
          raise: "#04212E", // elevated surface
          raise2: "#082C3B", // second elevation
          line: "#123748" // hairline border on dark
        },
        // Foreground — cool bone to sit on the teal ground (never #fff)
        bone: {
          DEFAULT: "#EAF2F4", // primary text
          dim: "#8298A3", // secondary text
          faint: "#4E6874" // tertiary / captions
        },
        // Single accent — Vulcanico, molten and loud but used sparingly
        ember: {
          DEFAULT: "#FF4103",
          hi: "#FF6A38",
          lo: "#C92E00"
        },
        // Utility signals kept muted and editorial
        moss: "#5FA37E", // positive / on-track (teal-leaning green, not neon)
        clay: "#E5484D", // caution / behind (a clear red, distinct from Vulcanico)
        paper: "#EAF2F4", // light surfaces use bone, never pure white
        // Bright landing base — warm-neutral off-white (not beige/cream), pairs with Vulcanico
        sand: {
          DEFAULT: "#F4F2EC",
          deep: "#ECE9E0", // slightly darker light surface
          line: "#DED9CC" // hairline on light
        }
      },
      fontFamily: {
        display: ['"American Captain"', '"Arial Black"', "Arial", "sans-serif"],
        serif: ['"Gloucester MT"', "Georgia", '"Times New Roman"', "serif"],
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
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "ember-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        },
        "clip-reveal": {
          from: { "clip-path": "inset(0 100% 0 0)" },
          to: { "clip-path": "inset(0 0 0 0)" }
        }
      },
      animation: {
        "rise-in": "rise-in 0.6s var(--ease-wreck) both",
        "fade-in": "fade-in 0.5s var(--ease-wreck) both",
        "bar-grow": "bar-grow 0.9s var(--ease-wreck) both",
        sweep: "sweep 1.4s infinite",
        marquee: "marquee 32s linear infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "ember-pulse": "ember-pulse 3.2s ease-in-out infinite",
        "clip-reveal": "clip-reveal 0.9s var(--ease-wreck) both"
      }
    }
  },
  plugins: []
};

export default config;
