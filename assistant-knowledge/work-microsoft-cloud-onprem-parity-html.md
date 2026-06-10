# One connector, two homes: the cloud/on-prem parity bet

_Section: Microsoft · Graph Connectors — source: /work/microsoft/cloud-onprem-parity.html_

Status: ready 

# One connector, two homes: the cloud/on-prem parity bet

Topic · Microsoft · Graph Connector Agent · founding-era design decision

## Why on-prem existed at all

The first connectors we built ran in Microsoft's cloud. A customer pointed us at a data source, we crawled it from our infrastructure, and the content showed up in their search index. That works right up until the customer's data isn't allowed to leave their network — which, for a large share of enterprise data, is the default and not the exception. Legal, security, and compliance teams will not sign off on shipping an internal file share or a developer-tools instance to a vendor's cloud, no matter how the encryption story reads.

So we became early developers on the Graph Connector Agent: a Windows background process the customer installs and runs inside their own ecosystem. It crawls the data locally and indexes the results back to Microsoft. The crawl happens where the data already lives, which is what makes the security review tractable — nothing sensitive crosses the boundary except the indexed output the customer has approved. ( Public docs. )

## The fork in the road

The obvious way to ship on-prem support is to treat it as a separate product. Cloud has its connectors; on-prem gets its own, written against whatever the agent makes available. Two codebases, two teams' worth of habits, two sets of bugs.

That path is seductive because each side looks simpler in isolation. It's also how you end up, two years later, with a feature that exists in the cloud Oracle connector but not the on-prem one, a checkpoint bug fixed in one place and not the other, and every new connector costing you double. On a team that was going to build a lot of connectors, that tax compounds badly.

## The decision: identical contracts, swappable orchestration

The bet we made was to refuse the fork. A connector — the thing that knows how to talk to Oracle, or a file share, or Azure DevOps, and turn what it finds into indexable items — should not know or care whether it's running in the cloud or on a laptop in a customer's data center. To make that true, two contracts had to be identical on both sides:

- The data contract — the shape of an item the connector produces, the metadata it carries, how access-control lists are attached, how content is chunked. Same in both homes. 

- The execution contract — how a crawl is started, checkpointed, paused, resumed, and reported on. Same lifecycle, same hooks, both places. 

With those two pinned down, the only thing that differs between cloud and on-prem is the orchestration layer : who schedules the crawl, where the process runs, how it gets its configuration and ships its output. The connector code — the part that's actually hard to get right, and the part that multiplies as you add sources — is written once and runs in either environment unchanged.

[diagram: Diagram of the parity architecture. At the top, two orchestration layers sit side by side: a Cloud orchestration box (scheduling and config in Microsoft's cloud) and an On-prem agent box (a Windows background process inside the customer network). Both point down into a single shared block labelled Shared connector core, which contains the connector logic, crawl lifecycle with checkpointing, and the item/ACL data model. That shared core points to the Microsoft index at the bottom. The figure shows that only the orchestration layer is duplicated; the connector core and the data and execution contracts are shared by both.] 

Two orchestration layers, one connector core. The expensive, bug-prone part is written once; only the thin layer around it knows whether it's cloud or on-prem.

The agent itself was built on the actor model with Akka.NET, which fit the workload — many concurrent crawl units, each with its own state and lifecycle, supervised and restartable. A few of us built the cross-cutting layers underneath all the connectors: logging, observability, the plumbing every connector would lean on. Getting those right early is what let later connectors be small.

## The payoff — measured in code that didn't have to be written

A design decision like this is only worth anything if it pays back. This one paid back twice, in a way that was easy to point at.

### Microsoft SQL Server on-prem: live with zero code change

Azure SQL and Microsoft SQL Server are effectively the same engine — one hosted on Azure, one running in the customer's data center. Because the Azure SQL connector had been built against the shared contracts, bringing SQL Server to on-prem wasn't a build at all. It was hosting the existing connector on the agent. It went live with no code change. That's the parity bet stated as plainly as it gets: the same connector, a different home, nothing rewritten.

### Oracle: a new database connector for the cost of its queries

Oracle was a genuinely new source, but the only part that was new was the part that's actually Oracle — the database queries. Everything else (the crawl lifecycle, checkpointing, the item and ACL model, logging, observability, the orchestration on both sides) was reused wholesale. The connector shipped to GA with very little new code. ( Public docs. )

There's a sequencing point worth making: the on-prem File Share connector going live first is what proved the on-prem model was stable. Once that was in production, the SQL Server and Oracle wins were unlocked — the proof that the shared core held up under a real on-prem workload is what made the cheap follow-ons safe to attempt rather than risky.

## Why this is the load-bearing decision

Most of the breadth on the portfolio page exists because of this one choice. Every connector after the first few got cheaper, because the expensive parts were already written and shared. New sources became "learn this source's data model and its access-control model, write that, reuse the rest." By the time connectors were being handed to me to own, building one no longer needed a team — and that's a direct consequence of the contracts holding identical across both environments.

The honest version of the staff-level claim here isn't "I wrote a lot of connectors." It's that an early architectural decision — made when the project was small and it would have been easier to just fork — set the ceiling on how much the team could take on later. The connectors are the visible output; the parity bet is the reason there were so many of them.
