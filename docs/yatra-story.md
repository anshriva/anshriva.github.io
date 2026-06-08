# Yatra — source story (raw)

This is the source of truth for the Yatra section of the portfolio, captured from the user's own telling. Everything previously in the repo about Yatra (deleted draft pages + resume bullets) was AI-fabricated and is disregarded. Build pages only from what is recorded here.

## Role envelope (confirmed)

- **Yatra Online · Gurgaon**
- Joined **September 2016 as Software Engineer**
- Promoted to **Senior Software Engineer in 2018**
- Resigned **March 2019**
- Team on joining: **Bus & Trains team**

## Chapter 1 — Observability / booking-health dashboard + alerting (early tenure)

Onboarding: started with bugs and small fixes to get comfortable with the codebase.

Then asked to build (really enhance) a **dashboard tracking bookings per hour** across both **Bus and Trains**, plus several other metrics.
- It connected to the **data source service** that hosts this booking information, pulled the data, and displayed it.
- **Users:** product managers and the engineering team — they could see the number of bookings happening.
- **Stack:** backend **Java**; frontend **EXT JS** (an old framework, but what was in use).

Insight after building it: nobody actually remembers to look at a dashboard every hour, so a dip in bookings could go unnoticed.
- Built a **scheduler inside the same observability service**: runs every hour; if there were **no bookings (or fewer than a threshold) in the last hour**, it **sends an email alert** describing the breaking scenario.
- Context: no **Splunk / Graylog** at Yatra in those days, so this filled the gap there was no tooling for.
- Also built a **daily morning email**: bookings done in the last 24 hours, number of searches, and a few more metrics.
- These were scheduler-driven.

Throughout this period there were ongoing bug fixes and small tasks alongside the main work.

## Chapter 2 — B2B "My Bookings" page for trains: legacy backend rewrite + frontend (self-taught)

A **B2B "My Bookings" page for train** (used by travel agents and similar B2B customers).
- It ran on a **legacy backend** with very badly written code — likely written in Yatra's earliest days. Methods were as long as **2,000–3,000 lines each**. The frontend was **JSP on the same backend service**.
- The user proposed to his manager a full **revamp of the backend system**; she approved ("yeah, go ahead and do it").
- Wrote a **new backend service** carrying over only the code that was actually important/needed — dropping the thousands of lines of dead/unused legacy logic.
- Also wrote the **frontend**, despite not being a frontend developer — self-onboarded and learned the frontend tech. Still **JSP**, but learned concepts like **Tiles**, etc.
- Built a clean **B2B My Bookings page for trains** and **shipped it to production**.
- Integrated user-facing features into the rebuilt page: **print e-ticket**, **send email to myself**, **send SMS**, etc.

## Chapter 3 — The third-party vendor-aggregation tool (SOAP) — becoming the expert

Yatra used a **third-party tool to make vendor API calls** — a control point for all calls going out to vendors.
- When a **new vendor** came up, that tool could make the call to the new vendor; the vendor configurations lived in that tool.
- Flow: the request goes to the tool → it **fans the request out to the downstream vendors**, **aggregates** their data, and returns it back to Yatra. A multi-layered aggregation system.
- **Bus had multiple vendors** (Yatra already had two for bus), so there was real routing/aggregation work to do. **Train had only one vendor — IRCTC** — so nothing to aggregate there.
- The user was asked to **get properly comfortable with the tool and learn it deeply** — and did, becoming the in-house expert, then **onboarded his expertise to that tool for bus** (the multi-vendor case).
- Big constraint/pain point: the tool was built on **SOAP APIs** — already outdated by 2016–2017 when everyone had moved to **REST**. Lots of challenges in this period stemmed from that.

## Chapter 4 — Replacing the SOAP tool with an in-house adapter-based aggregation service (the big one)

The pitch to the manager: **the third-party tool was too much to handle.**
- The user had taken a **full week of vendor training** just to understand how the tool behaved — and **no engineer is going to invest a week** to learn it. That was a structural problem, not a one-off.
- The tool required **lots of XML transformations** to convert each vendor's response into what Yatra understood, plus **XML aggregation**, plus hand-written **XSD schema designs** to map things. Painful and brittle.

Proposal: **build our own backend Java service** to do all of this. Manager approved.
- Added a **new aggregation service** sitting between the **upstream clients** and the **downstream suppliers**: upstream clients call this service → it **fans the request out to multiple suppliers**, **combines** the data, and returns it.
- **Key design decision — adapters over XML/JSON transformation logic.** Rather than relying on XML/JSON transforms (bad prior experience; logic creeps *into* the JSON over time), it was built as **adapters behind a common interface**: a **new vendor just implements the same interface and registers** — no tangle of bespoke transformation handling. Onboarding a new vendor became simple and isolated.
- **Outcome:** the service went live and **Yatra has used it ever since to make vendor calls.**
- **Resilience — circuit breakers.** Added circuit breakers using **Hystrix**: if a vendor is **down for more than a certain duration within a window**, that vendor is **short-circuited** and the call routes to the **other vendor**, keeping the **search page fast**.

## Chapter 5 — City-name autosuggest on the search page (in-memory Trie)

Added **autosuggestion for city names** on the search page.
- The data already lived in the **DB**; the goal was to expose it through autosuggest **without bombarding** the data source on every keystroke.
- City codes and cities **change over time**, so the source of truth stayed in the DB.
- The full set was small — roughly **10,000 cities** — so all of them were loaded into an **in-memory Trie data structure** to serve fast prefix lookups.

### Bus & Trains team — summary of focus

- **Primary contribution was Bus** (the multi-vendor side — where the aggregation/adapter/circuit-breaker work mattered).
- **Train** involvement was lighter: some integration with the **IRCTC API**, bug fixing, and mostly **enhancements** in the train section (e.g. the B2B My Bookings rebuild).

---

## Part 2 — Second team (from 2018, around the promotion to Senior SE)

Promoted to **Senior Software Engineer** on moving to this team (2018).

### Chapter 6 — Live database migration: MS SQL Server → PostgreSQL (+ MongoDB read model)

The team was migrating the **database from the old system to a new system**.
- **Old system:** **Microsoft SQL Server**, backed by a **third-party software** that generated the data — it wrote lots of tables and **very complex queries / stored procedures thousands of lines long**, all **tool-specific**.
- **Why migrate:** the company didn't want to be **tied to a single tool** for everything, didn't want the **MS SQL Server subscription**, and wanted to use their **own in-house Postgres** plus their **own tooling** to access the database.
- **New system:** **PostgreSQL** with in-house tooling.

**The hard part — migrating live.** New data kept arriving *while* the migration ran, so both the backfill and the live stream had to be handled.
- Built a **data pipeline**: whenever a change happens in the old database, the same change is **migrated immediately** to the new database, so queries always read from the new database. E.g. a **booking payment** completes → within **~1–2 seconds** the data is available in the new system.

**Performance gain as a side effect.**
- The old system needed **too many joins** in its stored procedures to assemble a single record.
- The new system kept the data **denormalized in a client-understood format**. The relational (Postgres) side still needs some joins, but they **also** stored a fully denormalized copy in **MongoDB** — **key = booking ID, value = the complete JSON**.
- Result: record retrieval went from **a few seconds → a few milliseconds**.

**Honest scope of the user's contribution:** mostly **execution** — migrating the **bus and train data** (he had the domain knowledge for those). **An architect designed the system**; the user's responsibility was to **implement along that architecture** — adding Kafka topics, database tables, creating a new database as the design required.

---

## Story status: COMPLETE

That is the full set of work at Yatra, per the user. No fabricated metrics — the old resume numbers (15× latency 3s→0.2s, 3× cost reduction) are disregarded. The only quantities the user actually stated:
- ~2,000–3,000 lines per method in the legacy B2B backend
- ~10,000 cities loaded into the in-memory Trie
- DB-migration pipeline: booking visible in new system within ~1–2 seconds
- DB-migration read path: a few seconds → a few milliseconds (Postgres + MongoDB denormalized read model)

### Page structure built (5 pages, confirmed with user)
1. overview.html (yatra-overview)
2. vendor-aggregation.html (yatra-vendor-aggregation) — centerpiece
3. booking-observability.html (yatra-observability)
4. b2b-bookings.html (yatra-b2b-bookings)
5. data-migration.html (yatra-data-migration)
City autosuggest (Trie) folded into overview, not its own page.
