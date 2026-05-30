#!/usr/bin/env python3
"""Create topic page stubs from data/navigation.json (skips existing files)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAV = ROOT / "data" / "navigation.json"

STUB = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — Anubhav Shrivastava</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/resume/css/styles.css" />
</head>
<body class="layout-docs" data-page-id="{page_id}">
  <aside id="site-sidebar" aria-label="Topics"></aside>
  <main class="topic-main">
    <article class="article topic-page">
      <header class="page-header">
        <h1>{title}</h1>
        <p class="subtitle">{subtitle}</p>
      </header>

      <section class="content-section" id="problem">
        <h2>Problem statement</h2>
        <p class="placeholder">What was broken or missing? Who was affected? What scale?</p>
      </section>

      <section class="content-section" id="context">
        <h2>Context &amp; constraints</h2>
        <p class="placeholder">Org boundaries, timeline, tech stack, NDA-safe scope.</p>
      </section>

      <section class="content-section" id="architecture">
        <h2>Architecture</h2>
        <div class="diagram-slot">
          <p class="diagram-slot-label">Diagram slot</p>
          <p>Add <code>assets/{page_id}/architecture.svg</code> or Mermaid here.</p>
        </div>
      </section>

      <section class="content-section" id="decisions">
        <h2>Key decisions &amp; tradeoffs</h2>
        <ul class="placeholder-list">
          <li>Decision 1 — …</li>
          <li>What we rejected and why</li>
        </ul>
      </section>

      <section class="content-section" id="impact">
        <h2>Impact</h2>
        <p class="placeholder">Metrics, rollout, who adopted it.</p>
      </section>

      <section class="content-section" id="faq">
        <h2>FAQ</h2>
        <dl class="faq">
          <dt>Interview question placeholder</dt>
          <dd>Answer placeholder.</dd>
        </dl>
      </section>
    </article>
  </main>
  <script src="/resume/js/nav-data.js"></script>
  <script src="/resume/js/sidebar.js"></script>
</body>
</html>
"""


def main() -> None:
    data = json.loads(NAV.read_text())
    created = skipped = 0

    for section in data["sections"]:
        for item in section["items"]:
            if item["path"] in ("/resume/index.html", "/"):
                continue
            path = ROOT / item["path"].lstrip("/")
            if path.exists():
                skipped += 1
                continue
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(
                STUB.format(
                    title=item["title"],
                    page_id=item["id"],
                    subtitle=section["title"],
                )
            )
            created += 1
            print(f"  created {path.relative_to(ROOT)}")

    print(f"Done: {created} created, {skipped} already existed.")


if __name__ == "__main__":
    main()
