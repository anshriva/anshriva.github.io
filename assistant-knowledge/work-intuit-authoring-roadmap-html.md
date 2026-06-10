# Notifications Platform Search — full-text discovery, zero incidents

_Section: Intuit · Notifications Platform — source: /work/intuit/authoring-roadmap.html_

Status: in production · 2+ years 

# Notifications Platform Search — full-text discovery over a point-query database

Topic · Intuit · Notifications Platform

0 
production incidents in 2+ years 

~10K 
notifications indexed & searchable 

2 → 1 
source tables joined into one index 

seconds 
write-to-searchable freshness 

## Problem statement

Our notifications platform sends the messages Intuit's products rely on — email, SMS, push, and in-product notifications. Each one is configured by someone inside Intuit: a product engineer who sets up the trigger, the template, the copy, the routing. Over the years that adds up to roughly 10,000 notifications , authored by people across many teams, many of whom have since moved on.

The configuration data lives in DynamoDB , split across two tables — a notifications table and a message templates table. DynamoDB is excellent at what it's built for: fast point queries when you already know the key. It is not built for the question we actually kept getting asked, which was the opposite of a point query:

- "Who configured this?" Someone drops a screenshot, or just a subject line, in a support thread and asks who owns this notification. It may have been set up years ago by someone no longer on the team — nobody remembers. 

- "Who's the author?" — during an incident. A production issue is unfolding and we need to reach the person who configured a specific notification, fast, while it's live. 

Answering either meant a human scanning lists by hand or the platform team being paged to act as a lookup service. There was no way to take a fragment of text — a subject line, a phrase from the body, an author's name — and find the notification behind it. We needed plain-text search across the catalog , and DynamoDB can't give you that.

## Context & constraints

- Wrong tool for the question. DynamoDB is a point-query store. Full-text search across an index — match on partial subject lines, bodies, authors — is exactly the access pattern it isn't designed for. 

- The data is spread across two tables. A useful search result needs fields from both the notifications table and the message templates table. Whatever we built had to join them into one coherent searchable record. 

- Modest scale, real discovery pain. ~10,000 records is small data — but discovery difficulty isn't about row count, it's about not having the right access path. Ten thousand things you can't search are ten thousand things you can't find. 

- Freshness matters. An author edits a notification and expects to find it immediately afterward. A search index that lags writes is one people stop trusting. 

- Don't take on infrastructure we don't need to own. A search engine carries real operational weight — upgrades, patching, networking, disaster recovery, schema governance. For a discovery feature, owning all of that ourselves would have been cost with no benefit to the team. 

## How it works

The shape of the solution was clear early. The source data already lived in DynamoDB, and capturing changes out of DynamoDB is a well-trodden path: change-data-capture (CDC) . Any write to either table flows out as a change record; a consumer turns that stream into search documents. The only genuinely open question was which search system to put behind it.

notifications table ┐
├─▶ DynamoDB Streams ─▶ Kinesis ─▶ CDC consumer ─▶ managed search index ─▶ query API ─▶ authoring UI
message templates ┘ (every write) (join 2 tables,
massage, thumbnail)

### The CDC pipeline

- Every write to the notifications or message-templates table emits a change record onto a Kinesis stream. 

- A CDC consumer reads the stream, joins the related records from both tables into a single denormalised document, and pushes it to the search index. Denormalising on write means the read path never pays a join cost. 

- The authoring UI calls a query API that translates the user's text and filter selections into index queries and returns ranked results. 

- I built it event-driven rather than batch on purpose: "remember to reindex" freshness guarantees don't survive production. Riding the change stream keeps the index within seconds of every write, with no operator effort. 

### Schema design: keywords vs. full text

The index schema deliberately splits fields by how they're queried. Fields you filter or facet on exactly — status , workspace name — are mapped as keywords , so they match precisely and aggregate cleanly. Fields you actually search into — subject lines, body copy, author — are mapped for full-text analysis. Getting this split right up front is most of what makes the results feel correct: exact things stay exact, fuzzy things stay fuzzy. Once the schema was in place, the existing ~10,000 records were backfilled so search was useful from day one rather than only for notifications edited after launch.

### Preview thumbnails — turning the catalog into something authors can see

On top of search we added a preview / thumbnail for each notification. The CDC consumer does a little extra massaging of the record before indexing so a result can render as a visual preview, not just a row of text. That single change is what lets the home page stop feeling like a database browser.

The platform's authoring home page had been a dense list — names, statuses, modification dates. To know what a notification actually looks like , an author had to click in, preview, and click back. Across ~10,000 notifications and hundreds of workspaces that's a lot of clicks. Once a Preview API existed on the new authoring stack, I ran it across all 3,550 active notifications in the prod-equivalent environment , captured the rendered output, and proposed the obvious next step: stop showing rows, show the notification.

The interesting question wasn't whether to do it — the screenshots made that decision easy. It was how . The straightforward implementation (render on demand, three API calls per visible card) would have made a dense home page feel slow. Pre-building previews on the change stream and serving them out of the search index — the same pipeline that already existed for text search — keeps the home page instant and reuses infrastructure we operate. Same shape as the search pipeline above: capture the change, assemble the document, index it; the thumbnail is just another field on the same record.

## Key decision: which search system

The CDC half of the design was settled. The leverage point was the search engine, so I wrote it up as a proper evaluation rather than reaching for the first option. Candidates I assessed:

Intuit managed search (OpenSearch-backed) 
Amazon OpenSearch (self-managed) 
Apache Solr 
Amazon Kendra 
Microsoft Search 

After a detailed comparison I chose Intuit's managed search platform — internally an OpenSearch-backed service. The deciding factor was where the operational burden lands. The managed platform absorbs the non-functional work that has nothing to do with our feature: version upgrades, networking/VPN, SSL and auth, regional disaster recovery. Schema changes are governed through GitHub, so index mappings are reviewed and version-controlled like any other code. All my team has to care about is writing documents and querying them well.

Self-hosting OpenSearch or Solr would have handed us more control and a permanent operations tax — cluster upkeep, patching, capacity, DR — for a discovery feature that needed none of it. Kendra and Microsoft Search were the wrong fit for indexing our own structured records out of a CDC stream. Taking the paved road was the decision that bought the next two years of quiet.

### Other tradeoffs

- Event-driven ingestion, not batch. More moving parts than a nightly reindex, but staleness is the bug authors notice instantly ("I just saved it — why isn't it here?"). Riding CDC keeps the index converged in seconds. Tradeoff: more failure surfaces; paid down by keeping the pipeline simple and the schema disciplined. 

- Denormalise across the two tables on write. Each search document is assembled from both source tables before indexing, so queries stay fast and simple. Tradeoff: the consumer owns the join logic; in exchange the read path has no joins at all. 

- Keyword vs. full-text, decided per field. Rather than indexing everything the same way, each field is mapped to how it's actually queried. Tradeoff: a bit more schema thought up front; far better relevance and clean facets forever after. 

## Impact

The headline isn't a feature — it's the absence of drama. This system has been in production for over two years without a single bug or incident. It just works. For a pipeline that touches every write to the catalog and serves live author and incident-time queries, "boring for two years" is the strongest result it could have.

- The "who configured this?" question is now self-serve. A subject line, a phrase, an author name — paste it in and find the notification and its owner in seconds. The platform team is no longer a human lookup service, including mid-incident when that lookup is most urgent. 

- Zero operational toll. Because the search infrastructure is the managed, paved-road platform and the pipeline is deliberately small, there has been nothing to patch, page on, or babysit. The reliability and the architectural restraint are the same decision. 

- The design generalised to the next stack. When the notifications portal later migrated to a next-generation platform — and the source of truth moved from DynamoDB to Postgres — the very same flow was rebuilt on top of domain events instead of DynamoDB/Kinesis CDC. Different change-capture mechanism, identical shape: capture changes → assemble a search document → index it in the managed search platform → query it. The proven design carried straight over to a completely different data substrate. 

## Notes & clarifications

Why not just query DynamoDB directly? 
DynamoDB is built for point queries against a known key, not for partial-text matching across an index. "Find every notification whose subject contains this phrase" is a full-text access pattern DynamoDB can only answer with an expensive scan. A search engine is the right tool for that question; DynamoDB stays the source of truth. 

Why a managed search service instead of running your own OpenSearch or Solr? 
Self-hosting buys flexibility we didn't need and a permanent operations cost we'd rather not carry — upgrades, networking, SSL/auth, disaster recovery, capacity. The managed platform absorbs all of that and version-controls schema changes through GitHub. For a discovery feature, the paved road was strictly better, and two incident-free years bear that out. 

How do you keep the index consistent when the data spans two tables? 
The CDC consumer joins the notifications and message-templates records into one denormalised search document before indexing, so a read never has to join anything. The risk with denormalisation is staleness if a write path is missed — which is exactly why ingestion is event-driven and fires on any change to either table. 

Why has it gone two years without a bug? 
A few reinforcing choices: a deliberately small, single-purpose pipeline; event-driven freshness so there's no batch job to drift; a disciplined keyword-vs-full-text schema so relevance was right from the start; and standing on a managed platform rather than operating search infrastructure ourselves. Restraint in scope is what made it boring — and boring is the goal. 

What changed when the portal migrated to Postgres? 
The source of truth moved from DynamoDB to Postgres during the next-generation portal migration, so the change-capture mechanism changed from DynamoDB/Kinesis CDC to domain events. Everything downstream stayed the same: assemble a search document, index it in the managed search platform, query it. The pipeline's shape was substrate-independent, which is why the migration reused it rather than rebuilding search from scratch.
