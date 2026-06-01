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

## Deploy

Push to `main` on `anshriva/anshriva.github.io` → GitHub Pages serves from the repository root.
