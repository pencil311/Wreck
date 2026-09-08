# Fonts

WRECK's type system pairs **Epic Pro** (display) with **Arial** (text).

Arial is a system font and needs nothing installed.

**Epic Pro is a licensed typeface** and is not redistributable, so it is not
committed here. To enable it, purchase/obtain the web license and drop these
two files into this folder:

```
public/fonts/EpicPro-Regular.woff2
public/fonts/EpicPro-Bold.woff2
```

The `@font-face` rules in `src/app/globals.css` already point at these paths,
so the display face activates automatically once the files are present.

Until then the `font-display` family gracefully degrades to a heavy Arial
(`"Arial Black", Arial`) so the visual hierarchy stays intact.
