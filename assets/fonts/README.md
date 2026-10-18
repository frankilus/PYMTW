# Locally hosted tool fonts

- DM Sans: original `tools/preview/v6/fonts/dm-sans-latin.woff2`, reduced to optical size 14 and weights 400–800 for the site’s Latin text.
- Fraunces: Google Fonts distribution v38, normal 500 and italic 400, converted to WOFF2 with Latin and common punctuation subsets. The older preview folder contains DM Serif Display, which is a different family and was not relabeled as Fraunces.
- Source: https://fonts.google.com/specimen/Fraunces and https://github.com/google/fonts/tree/main/ofl/dmsans
- Font licenses are included in `fraunces-OFL.txt` and `dmsans-OFL.txt`.

Font-display uses swap. Original preview font files are retained. Tools pages load fonts from this directory, without contacting a font provider.
