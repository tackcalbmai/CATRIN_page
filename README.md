# CATRIN

Multilingual website for the CATRIN bridal fashion salon.

## Pages

- `index.html` — concise homepage with services and dress selection
- `kleitas.html` — wedding dress lookbook
- `pakalpojumi.html` — dressmaking, alterations, care and accessories
- `salons.html` — salon and fitting process
- `atsauksmes.html` — animated editorial review page with verified Google and Facebook sources
- `kontakti.html` — compact contact details, direct WhatsApp booking, social channels, map and route links
- `privacy.html` — privacy information

The site uses a restrained text wordmark in the navigation and the supplied round SVG mark in the footer. A shared CSS and JavaScript system provides responsive layouts, keyboard-safe mobile navigation, multilingual content, subtle compositor-friendly motion, persistent desktop social shortcuts and a compact mobile action bar.

## Structure

- `styles.css` and `styles-core.css` — the visual system and responsive layouts
- `i18n.js` — final LV/RU/EN copy and localized metadata
- `app.js` — navigation, translation, gallery, reviews, booking and mobile behavior
- `scripts/validate-site.mjs` — dependency-free checks for page structure, local links, canonical URLs and deployment files

Run `npm run check` before publishing.

Public URL: https://catrin.lv/

Fallback GitHub Pages URL: https://tackcalbmai.github.io/CATRIN_page/
