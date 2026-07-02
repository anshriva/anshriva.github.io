# Résumé

_Section: Start — source: /resume.html_

ANUBHAV SHRIVASTAVA

Senior Software Engineer · Platform & Distributed Systems · 12+ years

Bengaluru, India • +91 8588876192 • anubhav.workemail@gmail.com •
LinkedIn •
Portfolio 

SUMMARY

I own Intuit's company-wide notification platform, the system every product team depends on to reach its customers, carrying tens of millions of messages a day. I led its biggest redesign, splitting authoring from delivery, and I'm the one teams escalate to when a notification goes missing across products. Two tax seasons under my ownership closed at 100% availability with zero customer-visible incidents. For twelve-plus years I've built the platforms other teams build on, and re-platformed live ones without anyone noticing. At Microsoft I went from founding engineer to lead of the Graph Connectors domain, where a single connector codebase indexed enterprise data across cloud and on-prem and roughly ten connectors shipped to GA at Fortune-500 scale. At Yatra I re-hosted a live travel-booking platform onto new suppliers. At Adobe I worked on the service that code-signed every product build before it shipped.

SCOPE & RECOGNITION

- Platform scale: 20–32M emails/day · 2–4M SMS/day · 2,200+ tray TPS at peak — serving QuickBooks, TurboTax, Credit Karma, Mailchimp, ProSeries, Lacerte and 10+ teams. 

- Five distinct ownership chapters on one platform, each on its own terms — lead engineer (authoring redesign), capability owner (two-way messaging), post-handover steward (SMS), platform owner (notification tray), solo build (platform search) — plus tax-peak readiness and the cross-org integration surface (single escalation point for partner teams across 10+ products). 

- Senior-leadership recognition — 17 Spotlight awards in tenure, including all six at the two highest tiers (Bravo and Salute): Credit Karma SMS launch on the platform (Bravo, Sheetal Sureka GEM, Jul 2026) · TY25 tax peak (Salute, Sheetal, Apr 2026) · TY24 tax peak (Bravo, Shanti Kuropati Director, May 2025) · SMS launch on the new stack (Bravo, Sheetal, Dec 2025) · Voice launch on the new stack (Bravo, Sheetal, Nov 2025) · Credit Karma Critical Money Alerts (Salute, Anand Abhyankar, Apr 2026). Includes the Lightning Award (fastest GenAI hackathon POC, Nov 2025). 

EXPERIENCE

Intuit 
March 2024 – Present | Bengaluru, India 

Senior Software Engineer — Notification Platform

Sole or lead engineer across five ownership chapters on Intuit's company-wide notification platform — authoring redesign, two-way messaging, SMS, notification tray, platform search — and the de facto technical owner partner teams escalate to across 10+ products.

Notification Authoring Portal — lead engineer on the authoring-stack redesign (~13 months)

- Owned the redesign end to end — proposed the architecture, built the four core services, ran the migration. Split one overloaded database into an event-driven CQRS system: normalized authoring on managed PostgreSQL (Aurora), denormalized delivery on DynamoDB at 2,000+ TPS, synced one-way by Kafka domain events (CDC), ending the cascading schema failures the shared DB caused. 

- Made the migration-safety call the whole cutover depended on: built a parity-comparator service that dual-read both stacks and diffed every response before traffic moved. 7-day audit — 2.9M+ reads at 99.987% match, every divergence root-caused. Migrated ~100% of traffic before tax peak: 10,000 notifications / 800 services / 10+ teams, zero customer-visible impact, API contract unchanged. The comparator is now the team's default for migrating any live system. 

- Owned the architecture decisions the team now builds on — managed PostgreSQL over self-managed, domain events over dual-write, gateway routing over a proposed backend-for-frontend — and set "API contract before implementation" as the review default. 

Two-way messaging — capability owner (RCS first bearer, SMS second)

- Defined and built a net-new platform capability: two-way messaging on Apache Pulsar. Broker-side header routing fans one shared inbound topic out to per-consumer topics, so a team self-onboards with a topic + routing rule and no platform code change — replacing a firehose every consumer had to filter in app code. 

- Brought RCS up as the first bearer at the same operational/SLO baseline as SMS (retry, fallback, observability, multi-subaccount billing); re-hosted inbound media to object storage so the vendor credential never leaves the platform boundary. SMS replies now ride the same capability as the second bearer — the routing model is a reusable primitive other teams onboard against. 

- Made the capability self-serve: authored the canonical onboarding guide + an internal Claude Code skill that makes it queryable from any engineer's terminal. Credit Karma's Critical Money Alerts is the first production consumer (Salute, Apr 2026). 

SMS — owner of channel adoption and the vendor-incident seat (post-handover)

- Grew the channel after I inherited a stable outbound path (incl. high-volume sign-in OTP) — onboarded six-to-seven high-volume consumer teams end to end: sender procurement, carrier registration, consent wiring, with procurement timelines folded into onboarding so launch dates held. 

- Shipped two-way SMS as the second bearer on the Pulsar inbound routing and made the call to terminate consent (STOP/START) at the platform, not the consumer — one missed opt-out can't become every team's regulatory exposure. Released vendor OTP localization behind feature flags, locale-by-locale, with no success-rate dip on the highest-volume traffic. 

- Primary incident commander when sign-in success rate degrades — the pager comes to me; I own the call to fail over to a secondary vendor (reversible, flag-gated), mitigate-first/escalate-in-parallel. SMS launch + migration recognised (Bravo, Dec 2025). 

Notification Tray & Platform Search

- Notification Tray — sole platform owner and single point of contact since 2024. Every integrating team comes to me; I own its reliability and roadmap. Shared in-product inbox on multi-region Cassandra (DataStax) self-managed on EC2, Solr index, WebSocket delivery. Added Resilience4j retries + distributed tracing, generalised identity addressing to onboard teams across namespaces, held it through TY24/TY25 peak. Identified the standing org risk (self-managed Cassandra), scoped the fix, and keep driving the case for an (unfunded) move to a managed NoSQL store — 15-day TTL makes cutover cheap (dual-write, no backfill). Encore, Aug 2025. 

- Notifications Platform Search — designed and shipped solo, zero incidents. CDC from DynamoDB → Kinesis → managed search index (ElasticSearch), fronted by a query API; still the only way the team answers "who configured this?" across ~10,000 notifications during incidents. Now leading V2 on the new stack and mentoring two engineers on it. 

How I operate across all five

- The platform's single escalation point. Partner teams across 10+ products (QuickBooks, TurboTax, Credit Karma) land with me first when they can't tell whether a failure is upstream, the platform, or the vendor — the disambiguation spans every workstream and belongs to no single one. 

- Tax-peak owner for the services I run. Kubernetes HPA autoscaling reviews, game-day region-failover drills, backup paths, retired the legacy scheduler — TY24 + TY25 both at 100% availability, zero customer-visible incidents. 

- Set technical direction beyond my own code. Drove the GenAI authoring agent (LangGraph, multi-agent) — working demo in 48 hours, Lightning Award, picked into the 2026 roadmap; won a home-page redesign by generating previews of 3,550 production notifications through the preview API instead of a doc; escalated and unblocked cross-org Pulsar routing that was stalling two teams' integrations. 

- Earlier cross-cloud consolidations: Credit Karma SMS (5-mo) and Mailchimp Notification Tray (4-mo, 700 peak TPS) — dual-company security reviews, consent passthrough, carrier short-code approval, identity conversion via the SSO identity API. 

Tech: Java 21, Spring Boot 3 · AWS (DynamoDB, Aurora PostgreSQL, Kinesis, EC2, S3-style object storage), Kubernetes + HPA autoscaling · Apache Pulsar, Kafka, Redis · Cassandra (DataStax), Solr, ElasticSearch / managed search · Resilience4j, distributed tracing, Splunk · LangGraph, Figma MCP · Patterns: event-driven CQRS, CDC, microservices

Microsoft 
April 2019 – Feb 2024 | Bengaluru 

Founding Engineer → Lead, Connectors Domain (~4 engineers) · L61 → L63, Senior SWE

Two promotions, one team, five years, ideation to GA. Graph Connectors Enterprise — the platform that crawls enterprise data sources (databases, file shares, wikis, internal websites, dev tools) and indexes them into Microsoft Search and Microsoft 365 Copilot.

- Made the architecture bet the portfolio rests on — kept the data and execution contracts identical across cloud and on-prem so one connector codebase runs in either place, with only the orchestration layer differing. The payoff was measured in code that didn't get written: Microsoft SQL Server on-prem went live with zero code change , and Oracle shipped with query-layer changes only — every crawl, logging, and observability layer reused wholesale. 

- Owned the connector portfolio end to end — ~10 GA connectors across 4 database engines plus file shares, the Azure DevOps connectors, Enterprise Web (robots.txt handling and web-graph cycle detection), Confluence, Azure Data Lake, and MediaWiki — spanning two traversal shapes: linear DB cursors with resumable checkpoints and graph traversal. First line of defense for the whole set: enterprise-customer calls, escalations, and debugging blind — no customer data, no PII in logs — at 99%+ crawl success. 

- Added access control and on-prem operability — flattened each source's native permissions into Microsoft's four-list identity model (allowed/denied users and groups) with identity sync running alongside content sync, shipped on the Azure DevOps Work Item and Wiki connectors. Made un-redeployable on-prem agents operable: heartbeat/liveness, version-deprecation surfacing in the admin portal, and opt-in auto-upgrade; certified crawls of 50M items with the disk benchmarks customers plan against. 

- Where it started — the first thing I shipped was platform plumbing, not a crawler: integrated Microsoft's internal experimentation and configuration system as a reusable library that became the baseline for ring-based staged rollout, internal employees out to government cloud — done through a Java/Maven → C#/.NET stack switch. Then built the first connectors (Azure SQL, then File Share on the Akka.NET actor model) and was an early developer on the Graph Connector Agent that made on-prem crawling possible. 

Tech: C#, .NET, Akka.NET (actor model), Azure, Redis, SQL

Yatra Online 
Sep 2016 – Mar 2019 | Gurgaon 

Software Engineer → Senior Software Engineer (promoted 2018) · Bus & Trains, then Booking Data Platform

- Replaced the third-party SOAP tool that fanned bus search out to suppliers with an in-house Java aggregation service — each vendor an adapter behind one common interface, so a new vendor onboards by implementing the interface and registering, no XML/XSD transformation tangle. Hystrix circuit breakers drop a failing vendor out of the path so search stays fast. It's still the path Yatra makes vendor calls through. 

- Senior SE on a live database migration — owned the bus and train slices of moving the booking store off Microsoft SQL Server (third-party-generated, thousand-line stored procedures) onto in-house PostgreSQL, against an architect's design. A change pipeline mirrored every write into the new store within ~1–2s while bookings kept arriving; a denormalized MongoDB read model (key = booking ID, value = full booking JSON) took record reads from seconds to milliseconds. Earlier: rebuilt the legacy B2B trains bookings page end to end (gutted 2–3k-line methods, self-taught JSP/Tiles frontend) and built booking-health alerting before the org had any log tooling. 

Tech: Java · Spring · Hystrix · PostgreSQL, MongoDB, MS SQL Server · Kafka · ExtJS, JSP/Tiles

Adobe Systems 
June 2014 – Aug 2016 | Noida 

Software Engineer — Engineering Security

- Contributed to the centralized code-signing service that pulled Adobe's product-signing private keys out of individual teams into one production-only store, with teams signing through a submit → approve → sign pipeline instead of holding keys — so every Windows, macOS, and JAR/ZIP/ZXP build shipped as a verified Adobe Systems publisher. 

- As SDE-1, built the ZXP signing type, an integration-test framework for signing scenarios, automatic retry handling for failed signings, a shared FTP library centralizing downloads and read-timeout handling, and enhancements to the REST API SDK client teams used to consume the service. 

Tech: Java · code signing (Windows / macOS / JAR / ZIP / ZXP) · REST SDK · FTP

SKILLS

Languages & Backend 
Java, C#, .NET, Python · Spring Boot, Akka, gRPC

Data & Messaging 
Aurora/PostgreSQL, DynamoDB, Cassandra, Redis · Pulsar, Kafka, Kinesis · OpenSearch, Solr

Cloud & Infra 
AWS, Azure · Kubernetes + HPA, Docker, Argo · Resilience4j, distributed tracing

AI / GenAI 
LangGraph, multi-agent systems, Figma MCP, LLM tool-calling

EDUCATION

B.Tech — Computer Science and Engineering 
Institute of Engineering and Technology, Lucknow | 2010–2014 | 74.4% 

View detailed portfolio → 
Print / Save as PDF
