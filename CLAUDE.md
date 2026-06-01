# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site live at **https://anshriva.github.io** — static HTML/CSS/JS, no build step, served by GitHub Pages from the repository root on push to `main`.

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

**Topic page convention.** Each topic page is a self-contained `<article class="article topic-page">` with `<section class="content-section" id="...">` blocks for `problem`, `context`, `architecture`, `decisions`, `impact`, `faq`. The `data-page-id` attribute on `<body>` matches the `id` in `navigation.json`.

## Deploy

Push to `main` on `anshriva/anshriva.github.io` → GitHub Pages serves from the repository root. No CI, no build.
