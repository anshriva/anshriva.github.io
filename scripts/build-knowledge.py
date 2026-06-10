#!/usr/bin/env python3
"""Generate clean markdown knowledge files from the portfolio pages, for upload
to Cloudflare AI Search (built-in storage).

Reads data/navigation.json, strips each listed HTML page to text, and writes one
markdown file per page into assistant-knowledge/. Re-run after content changes
and re-upload the files (or re-index) in the AI Search dashboard.

    python3 scripts/build-knowledge.py
"""
import json
import os
import re
import html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assistant-knowledge")


def strip_html(h: str) -> str:
    for tag in ("script", "style", "svg", "head"):
        h = re.sub(rf"<{tag}[\s\S]*?</{tag}>", " ", h, flags=re.I)
    # keep image alt text (diagrams describe themselves there)
    h = re.sub(r'<img[^>]*\balt="([^"]*)"[^>]*>', r" [diagram: \1] ", h, flags=re.I)
    # headings -> markdown so chunking keeps structure
    h = re.sub(r"<h1[^>]*>", "\n# ", h, flags=re.I)
    h = re.sub(r"<h2[^>]*>", "\n## ", h, flags=re.I)
    h = re.sub(r"<h3[^>]*>", "\n### ", h, flags=re.I)
    h = re.sub(r"<li[^>]*>", "\n- ", h, flags=re.I)
    h = re.sub(r"</(p|div|h[1-6]|section|article|figcaption|tr)>", "\n", h, flags=re.I)
    h = re.sub(r"<br\s*/?>", "\n", h, flags=re.I)
    h = re.sub(r"<[^>]+>", " ", h)
    h = html.unescape(h)
    h = re.sub(r"[ \t]+", " ", h)
    h = re.sub(r"\n[ \t]+", "\n", h)
    h = re.sub(r"\n{3,}", "\n\n", h)
    return h.strip()


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    nav = json.load(open(os.path.join(ROOT, "data", "navigation.json")))

    seen, count = set(), 0
    for section in nav.get("sections", []):
        sect_title = section.get("title", "")
        for item in section.get("items", []):
            path = item.get("path", "").split("#")[0]
            if not path or path in seen:
                continue
            seen.add(path)
            src = os.path.join(ROOT, path.lstrip("/"))
            if not os.path.exists(src):
                continue
            text = strip_html(open(src, encoding="utf-8").read())
            if not text:
                continue
            title = item.get("title", "")
            slug = re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-") or "page"
            header = f"# {title}\n\n_Section: {sect_title} — source: {path}_\n\n"
            with open(os.path.join(OUT_DIR, f"{slug}.md"), "w", encoding="utf-8") as f:
                f.write(header + text + "\n")
            count += 1

    print(f"Wrote {count} markdown files to {OUT_DIR}")


if __name__ == "__main__":
    main()
