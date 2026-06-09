# Portfolio "Ask about me" assistant — Cloudflare Worker

This folder holds the backend for the chat on the homepage hero. It's a single
Cloudflare Worker ([portfolio-bot.js](portfolio-bot.js)) that:

1. Holds the **Gemini API key** as an encrypted Cloudflare secret (never in this
   repo).
2. On each request, grounds the answer in the **full live portfolio**: it fetches
   `data/navigation.json` from `https://anshriva.github.io`, fetches every page
   listed, strips the HTML to plain text, and caches that corpus in memory for an
   hour. So the bot stays current with every `git push` to the site — no redeploy
   needed when you edit content.
3. Calls **Gemini 2.5 Flash** (thinking disabled, for speed) with a system prompt
   that makes the Staff-level case and stays title-honest, and **streams** the
   answer back token-by-token.

The frontend that calls it is [`../js/assistant.js`](../js/assistant.js); the
public Worker URL is hard-coded there (the API key is not — only the URL).

This whole folder is safe to commit publicly. There are no secrets in it.

---

## How it's deployed (Cloudflare dashboard)

It was set up entirely through the Cloudflare dashboard (no CLI / no Wrangler).
This is the exact path used, so it can be reproduced or handed off.

### Account
- Cloudflare account: `anubhav.workemail@gmail.com` (free plan).
- Workers subdomain: `anubhav-workemail.workers.dev`.
- Worker name: **`portfolio-bot`**.
- Live URL: **`https://portfolio-bot.anubhav-workemail.workers.dev`**.

### One-time creation steps
1. **dash.cloudflare.com → Workers & Pages → Create application → Create Worker.**
2. Chose **"Start with Hello World!"**, named it **`portfolio-bot`**, clicked
   **Deploy** (deploys a placeholder).
3. Opened **Edit code**, deleted the placeholder, pasted the entire contents of
   [portfolio-bot.js](portfolio-bot.js), clicked **Deploy**.
4. **Settings → Variables and Secrets → Add:**
   - Type: **Secret** (encrypted, hidden — not "Text")
   - Name: **`GEMINI_API_KEY`** (must match exactly — the code reads
     `env.GEMINI_API_KEY`)
   - Value: the Gemini API key from Google AI Studio
   - **Save / Deploy** (the secret only reaches the running Worker after a deploy).

### The Gemini API key
- Created at **Google AI Studio** (`aistudio.google.com/api-keys`), **free tier**.
  This is separate from any Gemini consumer subscription.
- Project: `gen-lang-client-0221033046` ("Gemini Project").
- **Model note:** the free tier quota is **model-specific**. `gemini-2.5-flash`
  has free quota on this project; `gemini-2.0-flash` returned HTTP 429
  (`limit: 0`) and must not be used here without checking quota. The model is set
  by the `MODEL` constant in `portfolio-bot.js`.

### CORS / allowed origins
`ALLOWED_ORIGINS` in `portfolio-bot.js` pins who may call the Worker
(`https://anshriva.github.io` + localhost for testing), so the key can't be
driven from arbitrary sites.

---

## Updating it

- **Update what the bot knows** — just edit the portfolio pages and push. The
  Worker re-reads the live site (cached ~1 hour; redeploy the Worker to refresh
  immediately). Adding a page to `data/navigation.json` makes the bot pick it up
  automatically.
- **Change any Worker logic** (model, prompt, tone, CORS) — edit
  `portfolio-bot.js`, then in the dashboard: **portfolio-bot → Edit code →**
  select-all, paste the new contents, **Deploy**.
- **Rotate the key** — if the key ever leaks: delete it in Google AI Studio,
  create a new one, and update the `GEMINI_API_KEY` secret in
  **Settings → Variables and Secrets**. No code change needed.

## Quick test (after deploy)

```bash
curl -s -X POST https://portfolio-bot.anubhav-workemail.workers.dev \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"question":"How do I get in touch?"}'
```

Expect a streamed plain-text answer. A `{"error":...}` JSON with a 4xx/5xx means
the key/secret or quota needs checking (see the model note above).

## Free-tier limits

- **Cloudflare Workers:** 100,000 requests/day on the free plan.
- **Gemini API:** free-tier rate/token limits per model (see Google AI Studio →
  Rate Limit). Portfolio traffic stays comfortably within both.

## Notes

- Deployment is **dashboard-only** — there is intentionally no `wrangler.toml`.
  If you later want CLI / push-to-deploy, add a Wrangler config then.
- Observability/tracing can be toggled in the Worker's Settings; it's optional
  and useful for reading the `console.error` logs this Worker writes on failures.
