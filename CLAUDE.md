# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site live at **https://anshriva.github.io** — static HTML/CSS/JS, no build step, served by GitHub Pages from the repository root on push to `main`.

The portfolio is structured as one topic page per project. The Intuit section (`work/intuit/*.html`) is the most actively developed — it's the user's pitch for a Staff Engineer role.

## Run locally

```bash
python3 -m http.server 8080   # from repo root, then open http://localhost:8080
```

## Add a topic page

1. Add an entry to `data/navigation.json` under the appropriate `sections[].items[]` (`id`, `title`, `path`, `status`).
2. Copy an existing topic page (e.g. `work/microsoft/move-next-latency.html`) to the new `path` and edit the content. Make sure `<body data-page-id="...">` matches the `id` from `navigation.json`.
3. Optional diagrams under `assets/<page-id>/`, referenced with `BASE_PATH`-prefixed paths.

For nav items that point to a hash anchor inside an existing page (e.g. `/work/youtube.html#sde-bootcamp`), do NOT create a new file — those anchors live inside the parent page.

## Architecture

**Path handling (the only non-obvious thing).** Every page sets `window.BASE_PATH` before loading anything else, and all CSS/JS/nav links are built by prefixing `BASE_PATH`. The site is currently served from the root domain, so `BASE_PATH = '/'`, but the indirection is preserved so the same files can be served from a project subpath without rewriting every link. Two patterns are in use, depending on the page's depth:

- `index.html` and `resume.html` (root): set `BASE_PATH = '/'` inline, use `document.write` to inject the stylesheet, and rewrite any `<a data-basepath="true">` link by prefixing `BASE_PATH` after DOM load.
- `work/*/*.html` (topic pages): pull in `js/base-path.js` first, then `document.write` the stylesheet, then load `js/nav-data.js` + `js/sidebar.js` which use `BASE_PATH` to fetch `data/navigation.json` and render hrefs.

If you add a new page, follow one of these two patterns exactly — don't hand-author `<link>` or `<script>` tags with raw absolute or relative paths.

**Sidebar.** Rendered at runtime by `js/sidebar.js` from `data/navigation.json` (loaded via `PortfolioNav.load()` in `js/nav-data.js`). Active-item detection in `itemIsActive()` strips `BASE_PATH` from `window.location.pathname` before comparing to the item's `path`. Expanded-section state is persisted to `sessionStorage` under key `portfolio-sidebar-sections`. Section titles are shortened for display via `shortSection()` — add new substring strippers there if you add a long section title.

**Topic page convention.** Each topic page is a self-contained `<article class="article topic-page">` with `<section class="content-section" id="...">` blocks. The standard sections (most pages have most of these, not all): `problem`, `context`, `architecture`, `decisions`, `impact`, `faq`. The `data-page-id` attribute on `<body>` matches the `id` in `navigation.json`.

**Cross-page links** inside the same directory (e.g. RFM Revamp page linking to Tax Season page) use `<a href="other-page.html" data-basepath="true">`. The trailing JS on each topic page rewrites these via the `BASE_PATH` mechanism — same pattern as the index/resume root pages.

## Content conventions (load-bearing for the Intuit section)

The Intuit pages are the active pitch artifact—the evidence for a Staff Engineer role. Several conventions emerged from iterative work and should be maintained.

**What this section is for:** Showcasing the *quality of decision-making and systems thinking*, not just scope or speed. A Staff Engineer is valued for navigating constraints, making trade-off decisions, and establishing patterns that improve organizational capability. The narrative should reflect that.

**Narrative framing: constraints, decisions, impact.**
- **Constraints**: What made the problem hard? (live traffic, data model complexity, team attrition, seasonal load, organizational boundaries)
- **Decisions**: What trade-offs did you make and why? (per-service vs per-notification, domain events vs dual-write, managed platform vs self-managed, etc.) Explain the reasoning, not just the choice.
- **Impact**: What changed for the org? (new patterns, reduced future risk, faster iteration, operational decoupling, sustainability for future growth)

Don't lead with numbers ("10,000 notifications") if they make the complexity sound smaller. Let the narrative demonstrate sophistication.

**No "begging for job" language.** This is not a platform to appeal to recruiters. Remove:
- FAQ sections or "for future recruiter agent" meta-commentary.
- Sections that *tell* the Staff case ("Why I'm ready for Staff") — let the work argue for itself.
- Pleading tone or apologetic framing.

Write as if explaining the work to peers. The Staff evidence comes through naturally.

**External-audience sanitization.** The portfolio is for technical recruiters outside Intuit. NEVER add:
- Links to `github.intuit.com`, `splunk.intuit.com`, `jira.cloud.intuit.com`, `devportal.intuit.com`, `*.api.intuit.com`, internal `*.app.intuit.com` URLs.
- JIRA/PR/CHG IDs (e.g. `OINP-21070`, `CCX-727`, `CHG9359960`).
- Slack channel names (`#customer-comms-pd`, `#oinp-prs`, etc.) — refer descriptively ("the platform leaders forum", "the cross-team support channel").
- Literal message topic paths (`persistent://...`) — describe the routing concept, not the path strings.
- Internal username `ashrivastav6` in any path or example.
- Internal team/product codenames where they aren't public Intuit products. **Keep**: QuickBooks, TurboTax, Credit Karma, Mailchimp, ProSeries, Lacerte. **Genericize**: Triton, VEP, SBSEG, Field Service, Acadia, IEP → "consumer teams", "upstream-product team", "internal product surfaces".
- Acronyms without context (spell out on first use, use plain language where possible).

The two exceptions where internal names appear verbatim are inside **quoted award citations** on the Recognition page (`work/intuit/recognition.html`) — those are direct quotes and shouldn't be edited.

**Title bar honesty.** Your title is "Senior Software Engineer · Platform & Reliability" (matching Workday). The Staff pitch happens through evidence (decision ownership, patterns established, organizational impact), never through inflated titles.

**Recognition is its own page** (`work/intuit/recognition.html`), accessible from the left nav. Spotlight email cards are rendered inline with sanitized HTML (Award IDs, Redeem URLs, mailtos, dates stripped). Platform overview links to Recognition; don't re-introduce the citation list on platform-overview itself.

**Awards count and tiers.** Match what's on the Recognition page. Spotlight tier ordering: Applause < Acclaim < Encore < Salute < Bravo. Sheetal Sureka is a Group Engineering Manager (GEM); Shanti Kuropati is a Director — keep titles accurate.

**On rewrites and iterations:** When asked to redesign a page, start completely fresh. Don't preserve old structure, old phrasing, or old framing. The goal is to find the strongest narrative, not to edit incrementally. If a full rewrite feels like the right move, do it.

## Resume specifics (`resume.html`)

Self-contained HTML — its own inline `<style>` block (not the portfolio dark theme), light background designed for printing. Recruiters print/PDF it.

- **3 pages max.** ~1700 words fits 3 pages with the current styles. Watch for repetition between SCOPE block, EXPERIENCE bullets, and SUMMARY — easy to accidentally describe the same thing three times.
- **Print rules.** `@media print { .print-button { display: none } }` already hides bottom buttons. If you add buttons or CTAs, make sure they're inside `.print-button` (or another container with `display: none` on print) — recruiters who print the resume shouldn't see web-only UI.
- **Bottom buttons.** Two buttons: "View detailed portfolio →" (secondary style) and "Print / Save as PDF" (primary). Both hidden on print. There's no top-of-page portfolio CTA — adding one looked awkward in the centered header.
- **Microsoft is a single company block** with two sub-headings (L63 and L61–L62) under it. Don't split it back into two separate company entries — that was the previous structure and was confusing.

## Deploy

Push to `main` on `anshriva/anshriva.github.io` → GitHub Pages serves from the repository root. No CI, no build.
