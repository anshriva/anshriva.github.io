# Portfolio (docs layout)

Collapsible sidebar navigation — one page per problem/topic with stable URLs.

## Run locally

```bash
cd portfolio
python3 -m http.server 8080
```

Open **http://localhost:8080**

## Add a topic

1. Edit `data/navigation.json`
2. `python3 scripts/generate_pages.py`
3. Fill in sections under `work/…`
4. Add diagrams in `assets/<page-id>/`

## Deploy

Push to `anshriva/anshriva.github.io` → GitHub Pages from repository root.
