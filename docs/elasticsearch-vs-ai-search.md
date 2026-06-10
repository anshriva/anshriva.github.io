# Why Elasticsearch (and not AI search) for notification search

Context: I own the **Notification Platform**. One requirement is to **search notifications** —
the data is **structured** (sender, consumer/team, channel, type, status, timestamps, payload
fields). This used to live in a relational DB; for plain-text search I index the same data into
Elasticsearch and query it there.

Notes for the "why didn't you use AI?" question. The argument isn't anti-AI; it's that
keyword/structured search and semantic/AI search solve **different problems**, and for
notification search the right primary tool is Elasticsearch. AI search earns a place as a
**side / fallback** path, not the primary one.

---

## 1. The one-line framing

The problem is **plain-text and field search over structured notification data**. That's
exactly what an inverted index is built for: exact and fuzzy term matching, ranking (BM25),
filtering, and aggregations — fast, deterministic, explainable.

AI / semantic search solves a *different* problem: meaning-level matching when the user's words
don't share vocabulary with the documents (synonyms, intent, natural-language questions). For
searching notifications by field and text, we don't have that requirement.

> "It wasn't a downgrade from AI — it was the right index for keyword retrieval. AI would have
> added cost and a tuning burden to solve a matching problem I didn't have."

---

## 2. Positive reasons to use Elasticsearch (especially for structured data)

- **Structured data fit.** Notifications are structured and came out of a relational DB. ES
  indexes them cleanly and lets me query by field (channel, type, consumer, status, time
  range) — not just by a blob of text.
- **Plain-text search is first-class.** Full-text matching, analyzers, fuzzy matching,
  relevance ranking — the core of the engine, not bolted on. Search the notification body/
  subject and still rank by relevance.
- **Filtering and aggregations are first-class.** Facet by channel, filter by status or time
  window, group-by / bucket aggregations (counts per type, per consumer, per day) come out of
  the box. On top of a semantic layer these are awkward and slow; in ES they're native.
- **Structured, deterministic response shape.** I always get back an **array of JSON**
  documents with the same schema. The frontend renders it directly — tables, lists, facets —
  with no parsing guesswork. (An LLM returns prose that varies every call; even with strict
  guardrails the shape drifts, so the UI can't depend on it.)
- **Cheap, fast, predictable latency.** Local index lookup, no per-query model calls — matters
  at notification volume.
- **Explainable.** I can see *why* a notification matched and scored where it did (term
  frequencies, field boosts). With vector similarity, "why did this rank third?" has no good
  answer.
- **Standard freshness pipeline.** Reindex on write is well understood; new notifications are
  searchable through the normal indexing path. Semantic search has to re-embed whenever content
  changes, or it goes stale.
- **Clear upgrade path.** If a real meaning-matching requirement shows up later, ES supports
  vector / hybrid search natively — additive on the same platform, not a rewrite.

---

## 3. Why AI search is not free — the tuning burden

When I evaluated semantic / vector search for this, the tuning surface was the problem. None of
the knobs have a universally correct value — they depend on the **shape of your data**, and they
have to be re-tuned when the data changes.

The knobs you end up fighting:
- **Retrieval method** — pure vector vs hybrid vs keyword
- **Similarity threshold** — the gate that decides what's "close enough"
- **Result count / cap** — how many results to return
- **Chunk size** — how documents are split upstream

Four coupled knobs, no setting that's correct in general, all sensitive to data distribution.

---

## 4. The failure that proves it — the confident false negative

The clearest failure mode of semantic search over uneven data:

- The notification corpus is **skewed**. A few notification types / high-volume consumers
  dominate the data; some categories are **small** (a low-volume channel, a single team's
  notifications).
- Search for something in a **small, underrepresented category** with a **short query**, and
  the query embeds *weakly* against that little slice — so the correct records score **low**.
- **The killer detail:** the similarity threshold is applied **before** the result cap. The
  correct records score below the gate and are dropped **before ranking could surface them**.
  The system doesn't say "low confidence" — it says **"no results / nothing found."**
- **Proof it's a tuning artifact, not missing data:** a richer, more specific query returns the
  same records fine — more context, stronger embedding, above the gate. Same data, different
  words, opposite answer.

**The dangerous failure mode of semantic search is the confident false negative.** A keyword
index that finds nothing returns nothing, and everyone reads that correctly. Semantic retrieval
buried real notifications below a threshold and reported them as *nonexistent* — a wrong answer
delivered with confidence. For a primary search people operate on, that's disqualifying.

---

## 5. The hybrid detour — the knobs aren't monotonic

The obvious upgrade — **hybrid search** — seems like it should fix the small-category problem.
It can make things **worse**: hybrid mixes in lexical scoring, and for short queries that biases
*even harder* toward the high-volume bulk (big categories have more term-frequency mass), burying
the small slice more.

What actually works is counterintuitive:
1. Stay **pure vector** (hybrid lost), and
2. **Remove** the similarity threshold (pin it to 0) — let rank + result cap do the limiting.

**Lesson:** the knobs are not monotonic and not independent. Turning on a "better" feature made
it worse; removing a "safety" feature made it better. You can't reason to the right config from
first principles — you measure against your real data, and the answer is often the opposite of
the intuitive one. Every config is coupled to *your* data's shape (a few dominant types + a long
tail of small ones), so it doesn't transfer to a different dataset.

> Say it accurately: *"I tried hybrid, it made it worse, so I stayed pure-vector and removed the
> threshold instead"* — **not** "I moved to hybrid."

---

## 6. Nondeterminism — the deciding factor for a primary path

AI is **nondeterministic on both ends**:
- **On retrieval** — it re-scores and re-ranks every query; the same search can surface
  different records, and can silently bury correct data (the small-category case).
- **On generation** — even with strict guardrails the model responds differently every time;
  wording, and sometimes structure, drifts. Cheaper models even garble exact values (IDs,
  numbers), which is fatal when notification search is about retrieving precise field values.

A primary search path has to be deterministic and explainable: if it finds nothing, that has to
*mean* nothing, and the response shape has to be stable enough for the UI to depend on.

---

## 7. The conclusion — side search, not primary search

> "I can't make a thing I don't fully control — that re-ranks and re-scores on every query, can
> silently bury correct notifications, and responds differently every time — the *primary* path.
> The primary path has to be deterministic, explainable, and structured. Semantic search earns
> its place as a **secondary / fallback** layer: when the keyword search comes back empty, *then*
> fall back to meaning-matching to catch the synonym and intent cases. Exact and explainable
> first; fuzzy and forgiving as backup."

That ordering — **keyword primary, semantic fallback** — is a respected production pattern, so
this is well-judged engineering, not rejecting AI.

---

## 8. Trade-off table (single slide)

| Dimension        | Elasticsearch (keyword/BM25)                  | Semantic / AI search                          |
|------------------|-----------------------------------------------|-----------------------------------------------|
| Best for         | Exact & fuzzy term, field lookup, filters, aggregations | Meaning/intent match, synonyms, NL questions |
| Data fit         | Structured notification data, first-class     | Unstructured / meaning-heavy text             |
| Response         | **Array of JSON, stable schema** → easy to render | Prose, varies every call                  |
| Determinism      | Deterministic, repeatable                     | Nondeterministic on query **and** generation  |
| Tuning           | Analyzers/boosts — stable, well-understood    | Threshold, method, chunking, cap — **data-coupled, re-tune on change** |
| Correctness      | Returns the literal record                    | May rewrite/redact/bury exact values          |
| Failure mode     | "No match" means no match                     | **Confident false negative** ("nothing found") |
| Cost / latency   | Cheap, local, predictable                     | Per-query embedding (+LLM) cost & latency     |
| Explainability   | Scoreable, debuggable                         | Opaque similarity score                       |
| Freshness        | Standard reindex on write                     | Must re-embed & re-upload                      |
| Upgrade path     | —                                             | **Native vector/hybrid in ES later**          |

---

## 9. Anticipated pushback

**"But ES also needs tuning (analyzers, boosts)."** True — concede it. The distinction: ES
tuning is **stable and deterministic** (set an analyzer once, it behaves the same forever).
Semantic tuning is **empirical and data-coupled** — the right threshold for today's data is wrong
after the data shifts. Conceding the small point makes the big one land harder.

---

## 10. Closing one-liners

- "It wasn't a downgrade from AI — it was the right index for the job I had."
- "I tuned that threshold many times and learned it can't be tuned right, because the correct
  value changes with every query."
- "A search you have to constantly re-tune against your own data, that can report real records as
  nonexistent, and that answers differently every time — that can be a *side* search. It can't be
  the *primary* one."
