# Fonts

WRECK's type system:

- **American Captain** — display (headlines, wordmark, metrics)
- **Gloucester MT Extra Condensed** — serif accent (eyebrows, pull quotes)
- **Arial** — body text (system font, nothing to load)

The two display faces are shipped as `.woff2` (converted from the supplied
`.ttf`) and load automatically via the `@font-face` rules in
`src/app/globals.css`:

```
public/fonts/american-captain.woff2
public/fonts/gloucester-mt-condensed.woff2
```

If a file is missing the family degrades to a heavy Arial / Georgia so the
hierarchy still reads intentionally rather than breaking.

## Licensing note

- `American Captain` ships under a **Personal-Use-Only** EULA.
- The Gloucester MT file came from a free-font aggregator (Gloucester is a
  Monotype trademark) and is **likely not licensed for commercial use**.

Both are fine for personal / development use. Obtain proper commercial
licenses before shipping this publicly.
