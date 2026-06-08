# Microsoft Work Story — Anubhav Shrivastava

Raw narrative captured from the user, in their own framing. To be shaped into
`work/microsoft/*` portfolio pages later. Append-only running log.

> **Source of truth.** This file is the correct record. The old `work/microsoft/*.html`
> pages were AI-generated from chat logs with incorrect metrics and invented details —
> they are being deleted and rebuilt from this file.
> **Sanitization:** genericize real customer names on the public site (e.g. "a 5M-item
> local-government customer", "a large energy enterprise") — do not publish them verbatim.

---

## Background / arc

- **April 2019** — joined Microsoft, **Graph Connectors** team.
- Team mission: crawl data from many external data sources and index it into Microsoft's indexes.
- Started as **Microsoft Search**, later evolved into **Microsoft Intelligence** (Copilot lineage).
- User's specific project: **Graph Connectors Enterprise** — indexing *enterprise* data, not regular B2C data.
- Project was at the **ideation stage** when the user joined — ground-floor / founding involvement.
- Stayed on the **same team for the full ~5-year** Microsoft tenure.

---

## 2019 — First project: Experimentation & Configuration integration

- Integrated Microsoft's internal **experimentation & configuration system** into the service, and packaged it as a **reusable library** for the whole team to consume.
- Role at the time: **developer / execution** focus (not yet lead).

**Challenges:**
- New domain. The experimentation product team gave **no support in the India time zone** — hard to get understanding over calls. Eventually got enough understanding to do the integration **independently** and build the shared library.
- **First project in the .NET world.** Came from a Java / Maven background; now on a **.NET Framework** project, wrestling with **NuGet** libraries.

**Impact:**
- Became the **baseline** for feature flagging / staged feature rollout across many areas of the project.
- Enabled **ring-based rollout** — e.g. roll out to internal Microsoft employees first, then progressively all the way out to **government cloud**.

---

## 2019–2020 — First connector: Azure SQL / MSSQL connector

- After the experimentation work, built the **connector for Azure SQL (MSSQL)**.
- **Why crawl a database?** Many websites/sources are powered by a database that renders data onto web pages. Some companies were willing to give Microsoft's service **read access to their database directly** — so the connector reads from the DB rather than scraping the surface.
- **Responsibility:** read the data in a **linear/sequential format**, maintain **checkpoints** so a crawl can resume from the same place, read through the dataset, and index into the Microsoft indexes.
- Full ownership of: **low-level design, coding, implementation**, getting data into the Microsoft index, and **surfacing + testing it from the Bing search page**.
- Also contributed to the **front-end repository** — but within the framework and coding guidelines already set by the FE developers (contributor, not framework owner there).
- **Outcome:** shipped / GA — available to anyone using Microsoft for business. This was the **first connector** he built.
- Public doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/mssql-connector

---

## 2020+ — Graph Connector Agent (on-premise) + File Share connector

- After Azure SQL, became **one of the initial developers** on the **Graph Connector Agent**.
  - Public doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connector-agent
- **Why:** lots of customer data is **on-premise**, and customers won't expose it to the cloud. Running the crawl **inside their own ecosystem** makes security approvals far easier — the agent is a **Windows-based background process** that runs on-prem, crawls the data, and indexes to Microsoft.
- **Key architectural decision:** keep the **data contract and execution contract identical** between cloud and on-prem, so the **same connector codebase runs in either place**. Only the **orchestration layer** differs (cloud vs on-prem); the connector + crawl logic is shared.
- Built the **File Share connector** on-premise.
  - Public doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/azure-file-share-overview — still in **GA, powering users**.
- **Major technical difference vs Azure SQL:** File Share is a **graph-based traversal** (tree/hierarchy) vs the **linear** read of a database.
- Tech: built with the **Akka framework (Akka.NET)** — actor model.
- He and a few teammates built **all the cross-cutting layers**: logging, observability, etc.

---

## On-prem proven → MSSQL on-prem + Oracle connector (payoff of the shared-contract decision)

- Once the **on-prem File Share crawler went live**, it **proved the on-prem model was stable**. This unlocked two follow-on responsibilities:
- **1. Microsoft SQL Server on-prem (live, zero code change).** Azure SQL and Microsoft SQL Server are effectively the same engine — Azure SQL runs on Azure, MSSQL Server runs on-prem. Because the connector code was already built for Azure SQL, the task was to **port/host it on the on-prem agent**. It went **live with no code change** — a direct payoff of the identical-contract decision.
- **2. Oracle database connector (on-prem, GA).** Added Oracle with **very minimal code change** — only the **database queries** changed; **all other layers were identical**.
  - Public doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/oraclesql-connector — **GA / live**.
- **Theme / impact:** two new connectors shipped with minimal effort — concrete proof that the **shared codebase + swappable orchestration/query layer** architecture paid off. The crawl/observability/logging layers were reused wholesale.

---

## Access control (ACL) + Azure DevOps connectors (identity crawl)

- Next charter item: the earlier connectors had **no access control** — add **ACL support** to new connectors.
- **The problem:** map each data source's native access-control model into **Microsoft's identity model**. Every indexed item must carry exactly **four lists**: **allowed users, allowed groups, denied users, denied groups**.
- Data sources have their own concepts — e.g. Azure DevOps has **groups** and **hierarchies**. These had to be **flattened** into the four-list model before indexing.
- **Two crawl types emerged:**
  - **Content sync** — crawl the actual content/data.
  - **Identity sync** — crawl the access control (users/groups/hierarchy) and push to the Microsoft indexes.
- **His responsibility:** *not* building the identity framework itself, but **building the new connectors** that crawl **both identity and data** from each source.
- **Shipped (both live in production):**
  - **Azure DevOps Work Item** connector — first to go live with this. Doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/azure-devops-work-items-overview
  - **Azure DevOps Wiki** connector — also live in production, built on similar lines. Doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/azure-devops-wiki-connector

---

## Cloud + on-prem parity proven → consolidation/ownership + Enterprise Web connector

- By this point there was **enough proof** that anything running on cloud can run on-prem with only the **orchestration layer differing**. From here, connectors were built for **both cloud and on-prem**.
- **Ownership consolidation:** building a connector became "just use the existing framework + write code," so it no longer needed many people. Several connectors built by teammates were **handed over to him for maintenance and enhancement**, and he **owned the complex scenarios** on the live connectors.
- **Enterprise / Internet Website connector** — live on **both on-prem and cloud**.
  - On-prem doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/enterprise-web-connector-onprem
  - Cloud doc: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/enterprise-web-connector
  - **Graph traversal.** Hard parts: respecting/saving **robots.txt**, and handling **cycles in the web graph** (avoid infinite loops when pages link back to each other).

---

## More connectors owned + Lead role (by 2024)

- Other connectors also **handed over to him** to own:
  - **Confluence** — on-prem: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/confluence-onpremises-overview · cloud: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/confluence-cloud-overview
  - **Azure Data Lake**: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/azure-data-lake-connector
  - **MediaWiki**: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/mediawiki-connector

- **By 2024 (when he left Microsoft):** he was the **lead of the connectors domain** — owning/managing the full set of connectors above, with a **team of ~4 developers under him**.

- **Challenges beyond coding:**
  - **Big enterprise clients:** had to understand their workflows, get on calls with them, and fix their bugs directly.
  - **Debugging without data access:** no access to customer data, and **no PII may be logged** — so debugging with **minimal logging** is genuinely tricky.
  - **On-prem = low room for error:** on cloud you can hotfix and redeploy immediately; on-prem you must **push customers to update their build**, which is hard. So the bar is **extra caution — no bug can ship to on-prem.**

---

## Platform features added to the on-prem crawler/agent

While building the connectors, also added many features to the **on-prem crawler/agent** itself as needs emerged:

- **Heartbeat / liveness:** agent continually sends a heartbeat to the server. If no heartbeat for a certain duration, the server is marked **dead** and shown as dead on the portal.
- **Version deprecation surfacing:** in the admin portal, admins see when their connector version is **deprecated / no longer supported**, prompting them to upgrade.
- **Auto-upgrade:** instead of an admin manually updating via the Microsoft admin portal, they can opt into **auto-upgrade** — the crawler keeps checking for the latest build and **upgrades itself**. (Big deal given the on-prem "hard to push updates" constraint above.)
- Evidence: release notes show many deprecated versions — https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connector-agent-releases

---

## Scale capabilities + certification / benchmarking

- Added capability to crawl **50 million items** (scale certification for the product).
- Established **disk-space benchmarks**: **40 GB for 5M items**, then **~9 GB per additional million items** beyond 5M.
- Troubleshooting / capacity guidance documented here: https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/connector-agent
- **Adopted by various clients** at this scale.

---

## Overall arc / role summary

- **Leveling: joined at L61, left at L63 (Senior SWE) — TWO promotions** over the 5 years.
- **Developer → Lead in 5 years** on this single project (Graph Connectors Enterprise).
- Contributed across **many areas** — not just coding.
- **First line of defense** for the entire connector portfolio: customer calls, understanding each enterprise's use case, handling **escalations**.
- Each connector serves **different companies/enterprises with their own use cases and challenges** — required working **very closely** with each of them.

---

## Feature-level accomplishments (confirmed REAL — details to be supplied by user)

These two are genuine accomplishments. The old pages described them but with
AI-invented/incorrect metrics. Capturing the gist here; user to supply the correct details.

### File Share exclusion rules — NO separate page (decided)
- Built exclusion-rule capability within the File Share connector so admins could exclude
  unwanted content/file types from a crawl. User's call: this is part of building the File
  Share connector, not a standalone deep-dive. **No dedicated page.** (Mention in passing
  under the connector portfolio if desired.)

### Crawl Success Rate (CSR) — NO separate page (decided)
- All connectors hit the success-rate number. User's call: crawl success is an obvious,
  table-stakes part of building any feature, not a standalone deep-dive. **No dedicated page.**

---

## Decisions on the old AI-generated pages (RESOLVED with user)

- **Move-next latency (60×, 30s→0.5s)** — NOT his work. **Dropped / page deleted.**
- **Admin self-serve / FHL hack** — **Folded into the on-prem agent-platform deep-dive**
  (it's the same admin-visibility theme as heartbeat/deprecation/auto-upgrade). No separate page.
- **ServiceNow ACL** — **AI-invented, deleted.** He never built a ServiceNow connector. The real
  access-control work was on **Azure DevOps** (identity sync / four-list model), captured above.

---

<!-- Continue appending below as the user shares more -->
