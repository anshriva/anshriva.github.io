# Portfolio

Collapsible sidebar navigation — one page per problem/topic with stable URLs. Live at **https://anshriva.github.io**.

## Run locally

```bash
python3 -m http.server 8080   # from repo root
```

Open **http://localhost:8080**.

## Add a topic

1. Add an entry to `data/navigation.json` under the appropriate `sections[].items[]`.
2. Copy an existing topic page (e.g. `work/microsoft/move-next-latency.html`) to the new path and edit the content.
3. Optional diagrams go under `assets/<page-id>/`.

## Analytics

Visitor and click analytics run on **[GoatCounter](https://www.goatcounter.com/)** — privacy-first and cookieless, so **no consent banner is needed**. Dashboard: **https://anshriva.goatcounter.com** (currently public).

- All logic is in **`js/analytics.js`** (one shared file). It loads GoatCounter — which auto-counts pageviews — and adds a single click listener that records custom events: sidebar nav clicks (`nav-*`), buttons/CTAs (`btn-*`), chat suggestion chips (`chat-chip-*`), the immersive toggle, and outbound email/external links (`outbound-*`). The only setting is the `ENDPOINT` constant at the top.
- The homepage chat also records `chat-question` on every question asked (via `js/assistant.js`) — **count only, the question text is never sent**.
- Loaded once per page with `<script src="…/js/analytics.js">`. There's no shared `<head>`, so when you **add a new page, include this line with the correct relative path** (`/js/…` at the root, `../js/…` one level deep, `../../js/…` for `work/*/*` topic pages).
- Events show up in the dashboard's **Pages** list alongside pageviews — filter by `chat`, `btn`, or `nav` to isolate them.
- **Localhost is ignored by default** to keep production stats clean. To count local testing, uncomment the `allow_local` block in `js/analytics.js` (re-comment it before trusting prod numbers).

Nothing to deploy separately — `analytics.js` ships with the site on push to `main`.

## Deploy

Push to `main` on `anshriva/anshriva.github.io` → GitHub Pages serves from the repository root.
