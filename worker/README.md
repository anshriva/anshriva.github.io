# Portfolio "Ask about me" assistant

The chat on the homepage hero. A visitor asks about Anubhav's work and gets a
streamed, evidence-based answer grounded in the portfolio.

This folder is the **backend**: a single Cloudflare Worker
([portfolio-bot.js](portfolio-bot.js)). The frontend that calls it is
[`../js/assistant.js`](../js/assistant.js). Everything here is safe to commit —
there are **no secrets in the repo** (the API key lives only as a Cloudflare
secret).

---

## Architecture — what is fetched from where

It's a **hybrid RAG** pipeline: Cloudflare AI Search does retrieval, the Claude
API does generation.

```
 Browser (index.html + js/assistant.js)
   │  POST { question, history }
   ▼
 Cloudflare Worker  (worker/portfolio-bot.js)
   │
   ├─ 1. RETRIEVE → env.AI_SEARCH.search(question)        ── Cloudflare AI Search
   │       returns the top ~12 relevant chunks               (vector search over the
   │                                                          indexed knowledge files)
   │
   ├─ 2. GENERATE → POST api.anthropic.com/v1/messages    ── Claude API
   │       system prompt + retrieved chunks + question       (claude-haiku-4-5, stream:true)
   │       streamed back as SSE
   │
   └─ 3. STREAM  → pipe Claude's token deltas to the browser as plain text
         ▼
 Browser renders the answer live as it streams in
```

**The two data paths:**

1. **Knowledge (build time, manual):** the portfolio's own HTML pages →
   [`../scripts/build-knowledge.py`](../scripts/build-knowledge.py) strips them to
   clean markdown → [`../assistant-knowledge/`](../assistant-knowledge/) → uploaded
   to the **Cloudflare AI Search** instance (`anubhav-portfolio`, built-in
   storage), which chunks + embeds + indexes them. Re-run the script and re-upload
   when portfolio content changes.

2. **Query (per question, live):** `question` → AI Search vector search → top
   chunks → Claude generates the answer from *only* those chunks → streamed to the
   browser.

**So the model never sees the whole portfolio** — only the handful of chunks
relevant to the question. That's the whole point of the RAG step (see design
choices below).

### What lives where

| Thing | Where | Notes |
|---|---|---|
| Chat UI, streaming reader | `js/assistant.js`, `css/styles.css`, `#ask-hero` in `index.html` | Only holds the **public** Worker URL — no key |
| Worker code | `worker/portfolio-bot.js` | Retrieval + Claude call + streaming |
| `ANTHROPIC_API_KEY` | Cloudflare secret on the Worker | Claude API key; never in the repo |
| `AI_SEARCH` binding | Cloudflare binding on the Worker → instance `anubhav-portfolio` | How the Worker calls retrieval |
| Indexed knowledge | AI Search instance `anubhav-portfolio` (built-in storage) | Generated from `assistant-knowledge/*.md` |
| Knowledge source files | `assistant-knowledge/*.md` (committed) | Regenerate with `scripts/build-knowledge.py` |

---

## Design choices (and why)

This started as a much simpler "stuff the whole portfolio into the prompt"
design and evolved under real free-tier constraints. The decisions:

**1. Static site → serverless proxy.** The site is static (GitHub Pages), so
there's no server to hold an API key, and a key in client-side JS on a public
repo gets scraped within minutes. A tiny Cloudflare Worker holds the key and is
the only thing the browser talks to. The frontend only knows the public Worker
URL.

**2. RAG instead of stuffing the whole portfolio into every prompt.** The first
version sent the entire portfolio (~25k tokens) to the model on every question.
That repeatedly hit free-tier walls — Gemini's free tier is **20 requests/day**,
Groq's is **12k tokens/minute** (one full-corpus request exceeded it). RAG fixes
the root cause: retrieve only the relevant chunks (~1.5–2k tokens) per question,
so each call is small, cheap, and well under any rate limit — *and* full
portfolio depth is preserved because the chunks come from the complete pages.

**3. Managed AI Search instead of a hand-built vector DB.** Cloudflare AI Search
does chunking, embedding, indexing, and retrieval as a managed service — far less
code than wiring up Vectorize + an embedding model by hand. Retrieval is the part
worth *not* hand-rolling.

**4. Built-in storage (upload files), not website auto-crawl.** AI Search can
auto-crawl a website, but only a domain on Cloudflare. The site is on GitHub
Pages, so we upload generated markdown files instead. Trade-off: the index must
be **refreshed when content changes** (re-run `build-knowledge.py`, re-upload) —
inherent to RAG, and cheap since the portfolio changes rarely.

**5. Claude for generation, not Cloudflare's own models.** AI Search's built-in
generation (`chatCompletions`) only runs Cloudflare-hosted models. Those (a
quantized Llama) **redacted/garbled phone numbers** (PII safety behavior) and
were lower fidelity. So we use AI Search for **retrieval only** (`.search()`) and
call the **Claude API** for generation. Claude is accurate, won't mangle a number
the user has stated is public, and at this volume costs ~$0.006/answer on Haiku
(\$5 of credit lasts months).

**6. Claude Haiku 4.5 specifically.** Cheap (\$1/\$5 per 1M in/out), fast, and
plenty strong for grounded Q&A over a fixed corpus. Swap `MODEL` to
`claude-sonnet-4-6` for more reasoning at ~3× the cost.

**7. Honesty over persuasion in the system prompt.** It makes the Staff-level
case through *evidence* (decisions, trade-offs, patterns set), never by inflating
scale or adding hype words, and stays title-honest (Senior Software Engineer at
Intuit; never claims a Staff/Principal title). An exaggeration a reviewer catches
discredits the whole pitch — accuracy is the more convincing choice.

**8. Streaming end to end.** Claude streams SSE → the Worker pipes the text
deltas through → the browser renders them live. First token ~4.5s (retrieval +
first token), then it types out.

**9. History capped at 2 turns** (`HISTORY_TURNS`) for cost — each prior turn is
billed input tokens. Raise it for longer conversational memory.

**10. Prompt caching deliberately *not* used.** It doesn't fit: the only stable
prefix (the system prompt, ~700 tokens) is below Haiku 4.5's 4,096-token cache
minimum, the retrieved chunks are different every question (not a reusable
prefix), and portfolio traffic is too sparse to amortize the cache-write premium
within the 5-minute TTL.

**11. Raw upstream errors surfaced to the client.** On an error the Worker
returns the actual status + detail; the frontend shows it. The audience is
technical, and the API key never appears in a response body.

---

## How it's deployed (Cloudflare dashboard, no CLI)

- **Account:** `anubhav.workemail@gmail.com` (free plan). Subdomain
  `anubhav-workemail.workers.dev`.
- **Worker:** `portfolio-bot` → `https://portfolio-bot.anubhav-workemail.workers.dev`.
- **AI Search instance:** `anubhav-portfolio` (Build → AI → AI Search), data
  source **Built-in storage**, indexed with the files in `assistant-knowledge/`.

### Bindings + secret on the Worker (Settings)
- **AI Search binding** — variable name **`AI_SEARCH`** → instance
  `anubhav-portfolio`. (Note: the instance is **semantic/vector** only, so the
  Worker requests `retrieval_type: 'vector'`.)
- **Secret** **`ANTHROPIC_API_KEY`** — the Claude API key from
  console.anthropic.com (buy ~\$5 of credit; new accounts get a small starter
  credit).

### Deploying a Worker change
Edit `portfolio-bot.js`, then in the dashboard: **portfolio-bot → Edit code →**
select-all, paste, **Deploy**. (Dashboard-only — intentionally no
`wrangler.toml`.) Committing the repo file does **not** redeploy the Worker.

---

## Updating it

- **Change what the bot knows** — edit the portfolio pages, run
  `python3 scripts/build-knowledge.py`, then re-upload the
  `assistant-knowledge/*.md` files to the AI Search instance (Items → Upload /
  re-index). This is the one manual step RAG adds.
- **Change behavior / tone / model** — edit `portfolio-bot.js`
  (`SYSTEM_PROMPT`, `MODEL`, `MAX_RESULTS`, `HISTORY_TURNS`) and redeploy.
- **Rotate the Claude key** — create a new key at console.anthropic.com, update
  the `ANTHROPIC_API_KEY` secret. No code change.

## Quick test (after deploy)

```bash
curl -s -X POST https://portfolio-bot.anubhav-workemail.workers.dev \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"question":"What did he do at Microsoft?"}'
```

Expect a streamed plain-text answer. A `{"error":...,"detail":...}` JSON means
the binding, secret, or retrieval needs checking — the `detail` says which.

## Cost & limits

- **Cloudflare AI Search / Workers AI / Vectorize** — free-plan allowances cover
  portfolio traffic comfortably (retrieval is well within the free tier).
- **Claude API** — ~\$0.006 per answer on Haiku 4.5; \$5 of credit ≈ ~800
  answers. The only paid component, and trivially cheap at this volume.
