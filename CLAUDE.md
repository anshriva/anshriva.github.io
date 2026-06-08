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

**Diagrams.** Topic-page diagrams are hand-authored SVGs under `assets/<page-id>/<name>.svg`, embedded as `<img>` inside a `<figure>` with a thorough `alt` text describing every node and edge (so the page reads without the image) and a short `<figcaption>` underneath reinforcing the one idea the diagram is making. Visual style matches across pages: white background (`#ffffff`), `#334155` stroke, DM Sans font, rounded corners (`rx="16"` for primary nodes, `rx="8"` for secondary), explicit `viewBox`. **Use generic node labels** — no vendor names, no internal hostnames, no team channels — the same sanitization that applies to prose. References: `work/intuit/notification-tray.html` (architecture.svg) and `work/intuit/rcs-launch.html` (inbound-flow.svg). The explicit white background means the SVG renders the same in both light and dark site themes without needing CSS-var theming.

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
- **The acronym "RFM" in prose, headings, titles, or nav titles.** It's an internal Intuit name for the Notifications Authoring Portal — no external reader knows it. Use **"Notification Authoring Portal"** (or **"the authoring portal"** / **"the authoring stack"** after first mention). Internal-only filenames and `data-page-id` values (`rfm-revamp.html`, `intuit-rfm-revamp`) can keep the acronym — they're not user-facing. The only prose exception is verbatim Spotlight citations on `recognition.html`.
- Acronyms without context (spell out on first use, use plain language where possible).
- Links to external diagram boards (e.g. Excalidraw "View interactive version →") **only if the board itself is already sanitized**. Raw boards often still show internal node labels (`OINP-Tray`, internal system names). Either rename the labels in the source board first, or recreate the diagram as a sanitized local SVG/PNG under `assets/<page-id>/` and skip the interactive link.

**Sanitize nav titles too.** `data/navigation.json` is a separate surface and easy to forget. Internal acronyms (e.g. "RFM Revamp") survive multiple page-body edits because nav stays out of view. When you rewrite a topic page, re-read its sidebar entry and check for internal-only acronyms or product codenames the same way you check the prose. The current convention is to match the nav title to the page's H1 verbatim where it fits the sidebar width.

The two exceptions where internal names appear verbatim are inside **quoted award citations** on the Recognition page (`work/intuit/recognition.html`) — those are direct quotes and shouldn't be edited.

**Title bar honesty.** Your title is "Senior Software Engineer · Platform & Reliability" (matching Workday). The Staff pitch happens through evidence (decision ownership, patterns established, organizational impact), never through inflated titles.

**Recognition is its own page** (`work/intuit/recognition.html`), accessible from the left nav. Spotlight email cards are rendered inline with sanitized HTML (Award IDs, Redeem URLs, mailtos, dates stripped). Platform overview links to Recognition; don't re-introduce the citation list on platform-overview itself.

**Awards count and tiers.** Match what's on the Recognition page. Spotlight tier ordering: Applause < Acclaim < Encore < Salute < Bravo. Sheetal Sureka is a Group Engineering Manager (GEM); Shanti Kuropati is a Director — keep titles accurate.

**On rewrites and iterations:** When asked to redesign a page, start completely fresh. Don't preserve old structure, old phrasing, or old framing. The goal is to find the strongest narrative, not to edit incrementally. If a full rewrite feels like the right move, do it.

**Prose voice — write like a tired engineer, not an essay generator.** The user is sensitive to "AI-sounding" copy. Avoid the tells:
- The antithesis construction ("not X — it's Y", "a federation problem, not a feature toggle"). One per page at most; a human doesn't reach for the same balanced contrast every paragraph.
- Rule-of-three parallel triads ("the integration point, the reliability owner, and the voice for its direction").
- Scare-quotes around abstractions ("a notification", "problem solved").
- Meta-commentary that narrates its own rhetoric ("I'm including this deliberately…").
- Exhaustive verb/noun lists ("stores, indexes, de-duplicates, expires, and serves").
Make sentences uneven — vary length, let some claims land flat without a flourish. Plain words over polished ones.

**Don't re-inflate claims to what the work wasn't.** Across edits it's easy to drift back toward grander framing. Match the page to what the user actually did. Specific load-bearing cases:

- `work/intuit/notification-tray.html` is framed around **platform ownership and consumer onboarding**, with the Cassandra→managed-store migration stated honestly as an *unfunded proposal* ("risk understood, fix scoped, waiting on investment"). Do not reframe it as executed work, and do not re-add deep incident-forensics narration — the production support there was shallow (traces/metrics dashboards), not deep root-cause ownership.
- `work/intuit/rcs-launch.html` is framed around the **two-way messaging capability the platform now offers**, with RCS as the *first bearer it carries* — not "shipped a new bearer end to end." The pre-existing inbound service did consent capture + firehose-to-event-bus only; the work was redesigning inbound on Pulsar so the broker handles per-consumer routing, plus standing up the RCS service alongside SMS at the same reliability baseline. The reliability story is **honest by case**: union of SMS+RCS for transactional/OTP traffic, RCS-alone for interactivity (marketing, conversation). SMS stays the floor at ~70% RCS penetration. Do not flatten this to "RCS is more reliable than SMS," and do not reframe the page as bearer-centric.
- `work/intuit/sms-channel.html` is framed around the **post-handover ownership chapter on SMS**, not the RFM SMS launch / migration. The channel was handed over after outbound (incl. high-volume OTP) was already stable; the page is about what came after: onboarding six-to-seven high-volume consumer teams (sender procurement + carrier registration + consent wiring), adding two-way SMS as the second bearer onto the inbound routing capability described on the RCS page, releasing OTP localization without an outage (a **vendor feature** whose safe release was the work — do not inflate to "designed multi-locale OTP"), and being primary IC for vendor sign-in incidents (mitigate-first/escalate-in-parallel). Do not re-tell the inbound Pulsar routing architecture here — reference the RCS page. The Dec 2025 RFM SMS launch Bravo citation belongs on the Recognition page, not as this page's framing.

**Watch for cross-section duplication.** On topic pages the same idea easily lands in three sections (e.g. an ownership statement in the intro and again in Impact; a shipped capability in both "what I shipped" and "key decisions"). Let each idea have one primary home: *what* in the shipped/architecture section, *why/trade-off* in decisions, genuine *outcomes* in impact. Intentional foreshadow→payoff (a constraint named early, paid off later) is fine; verbatim restatement is not.

## Resume specifics (`resume.html`)

Self-contained HTML — its own inline `<style>` block (not the portfolio dark theme), light background designed for printing. Recruiters print/PDF it.

- **3 pages max.** ~1700 words fits 3 pages with the current styles. Watch for repetition between SCOPE block, EXPERIENCE bullets, and SUMMARY — easy to accidentally describe the same thing three times.
- **Print rules.** `@media print { .print-button { display: none } }` already hides bottom buttons. If you add buttons or CTAs, make sure they're inside `.print-button` (or another container with `display: none` on print) — recruiters who print the resume shouldn't see web-only UI.
- **Bottom buttons.** Two buttons: "View detailed portfolio →" (secondary style) and "Print / Save as PDF" (primary). Both hidden on print. There's no top-of-page portfolio CTA — adding one looked awkward in the centered header.
- **Microsoft is a single company block, one flat bullet list** — no L63 / L61–L62 sub-headings. The founding→lead arc and both promotions (L61 → L63) live in the `job-title` line and dateline; the bullets are ordered by strength (architecture bet first, founding work last), not chronologically. Don't re-split it into per-level sub-sections or into two separate company entries — both were earlier structures and were confusing/buried the best material. The Microsoft content is rebuilt from `microsoft-story.md` (the source of truth) and `work/microsoft/*`; the old AI-generated metrics (move-next 60×, ServiceNow, 25 items/sec) and real customer names are fabrications/sanitization violations — do not reintroduce them.

## Deploy

Push to `main` on `anshriva/anshriva.github.io` → GitHub Pages serves from the repository root. No CI, no build.

## Commits

Never run `git commit` on this repo without the user explicitly asking in the current turn. Confirming "commit this" once does not authorize subsequent commits later in the same session — each commit needs its own ask. After completing edits, stop at the staged-changes boundary (or describe what would be committed) and wait. Same posture for `git push`, `git rebase`, `git reset`, branch deletes, and PR creation.
