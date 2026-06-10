# Graph Connectors — scope, role & arc

_Section: Microsoft · Graph Connectors — source: /work/microsoft/graph-connectors-overview.html_

Status: ready 

# Microsoft — Graph Connectors Enterprise

Apr 2019 – 2024 · One team, five years · L61 → L63 (Senior SWE), two promotions, developer → lead

## What this is, and what these pages cover

Graph Connectors is the part of Microsoft that crawls data out of external systems — databases, file shares, wikis, internal websites, developer tools — and indexes it so it shows up in Microsoft Search and, later, Microsoft 365 Copilot. The team I joined was building the enterprise side of that: not consumer data, but the systems large companies run inside their own walls. Public docs for most of what's below live on learn.microsoft.com , since these connectors are generally available and in production today.

I joined in April 2019 when this project was still at the ideation stage, and I stayed on the same team the whole five years. That's unusual, and it's the reason these pages read the way they do — I was there from the first connector through to leading the connector domain, so I watched (and made) the decisions that compounded. I came in at L61 and left at L63, a Senior SWE, two promotions over the run.

The chapters below each have their own page in the left nav. Taken together they're the point: the breadth of production-grade systems I built and then owned, and the single architectural bet that let that breadth happen without the team drowning in it.

The breadth wasn't only connectors, either. The first thing I shipped here was platform plumbing, not a crawler — and the surface area over five years looked like this:

- 10 connectors, GA 

- Cloud + on-prem parity 

- 4 database engines 

- Web crawling (robots.txt, cycles) 

- Identity / ACL crawl 

- Experimentation & config platform 

- Ring-based rollout → gov cloud 

- Akka.NET actor model 

- Agent operability (heartbeat, auto-upgrade) 

- 50M-item scale certification 

And it spanned a language switch: I came in from Java and Maven and did all of this in C# on .NET. Below, the chapters; then how the role itself changed underneath the work.

## The chapters

### 1. Cloud and on-prem parity — the architectural bet that paid off (founding-era design decision) 

Customers won't always hand their data to the cloud, so a lot of crawling has to run inside the customer's own network. We were early developers on the Graph Connector Agent — a Windows background process that runs on-prem, crawls, and indexes back to Microsoft. The decision that mattered: keep the data contract and the execution contract identical between cloud and on-prem, so one connector codebase runs in either place and only the orchestration layer changes. The payoff showed up later when two new connectors went live with near-zero new code. The parity page walks through the bet and the payoff.

### 2. The connector portfolio — the breadth (built, then owned) 

Azure SQL was the first I built end to end. After that came File Share, Microsoft SQL Server on-prem, Oracle, the Azure DevOps connectors, the Enterprise Web connector, and a set handed to me to own — Confluence, Azure Data Lake, MediaWiki. Some read data linearly, like a database cursor with checkpoints; others traverse a graph and have to handle robots.txt and cycles in the web. The portfolio page covers the range and what made each one its own problem.

### 3. Access control — mapping every source onto one identity model (connector ownership) 

Indexed content is useless — and a leak risk — if the search results don't respect who's allowed to see what. The charter was to add access control to the connectors: take each source's native permission model and flatten it into the four lists Microsoft's index understands (allowed users, allowed groups, denied users, denied groups), and crawl identity as its own sync alongside content. I built the Azure DevOps Work Item and Wiki connectors against that model. The access-control page has the detail.

### 4. The on-prem agent platform — making a thing you can't redeploy operable (platform features + scale) 

On-prem software has a brutal constraint: you can't hotfix it. The customer runs the build, and getting them to update is the hard part. So a lot of work went into the agent itself — heartbeat and liveness so a dead agent shows as dead, version-deprecation surfacing in the admin portal, and opt-in auto-upgrade so the agent keeps itself current. Plus the scale work: certifying crawls of 50 million items and publishing the disk benchmarks customers plan against. The agent-platform page covers both.

## How the role changed over five years

The growth from L61 to L63 wasn't a title change with the same job underneath it. The work genuinely changed shape.

- 
Started in execution. The first project was integrating Microsoft's internal experimentation and configuration system into the service and packaging it as a reusable library. New domain, new language — I came from Java and Maven and was suddenly in .NET Framework wrestling with NuGet, with no support in the India time zone from the product team that owned the experimentation system. I got far enough on my own to do the integration and ship the shared library, and it became the baseline for staged, ring-based rollout across the project — internal Microsoft first, all the way out to government cloud.

- 
Became the person who builds connectors end to end. Low-level design, implementation, getting data into the index, and proving it surfaced correctly on the search page. Each connector meant learning a new source's data model and its failure modes.

- 
Then the one connectors get handed to. Once building a connector became "use the framework and write the source-specific code," it stopped needing a crowd. Connectors other engineers had built were handed to me to maintain and extend, and I owned the complex live scenarios on them.

- 
By 2024, lead of the connectors domain with a team of about four developers under me, owning the full set above. The job by then was as much enterprise-customer work as code — getting on calls with big clients to understand their workflows, debugging their issues directly, and handling escalations as the first line of defense for the whole connector portfolio.

## The constraints that ran underneath all of it

Two things shaped nearly every decision on this team, and they're worth naming once here because the topic pages assume them.

- 
Debugging blind. No access to customer data, and no PII allowed in logs — ever. You diagnose production issues for enterprise customers with deliberately minimal logging, which means the logging and observability you do have has to be designed for exactly that, well before you need it.

- 
On-prem has no undo. On the cloud you hotfix and redeploy in minutes. On-prem you have to convince a customer to roll out a new build, which is slow and sometimes doesn't happen. So the bar for on-prem is simply higher: a bug that ships there can sit in the field for a long time. Most of the agent-platform work exists to soften that constraint.
