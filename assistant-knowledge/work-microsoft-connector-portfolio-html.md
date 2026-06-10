# The connector portfolio — the breadth, source by source

_Section: Microsoft · Graph Connectors — source: /work/microsoft/connector-portfolio.html_

Status: ready 

# The connector portfolio — the breadth, source by source

Topic · Microsoft · Graph Connectors · built, then owned

## What a connector actually has to do

Every connector solves the same shape of problem and none of them solve it the same way. It has to authenticate to a source it doesn't control, walk everything in that source without missing items or looping forever, read each item without holding the whole dataset in memory, checkpoint so a crawl that dies at item nine million resumes at item nine million and not at zero, attach the right access-control lists, and hand a clean stream of indexable items to Microsoft's index. Then it has to do that again next sync, noticing what changed.

The differences live in the source. A database is a cursor you read in order. A file share is a tree you descend. A website is a graph that links back on itself and tries to trap you. Each of those is a different traversal problem with its own failure modes, and that's the variety this page is about. The shared parts — lifecycle, checkpointing, observability — were reused across all of them, which is the whole point of the parity bet .

## The two traversal shapes

Almost every connector falls into one of two camps, and which camp it's in decides most of its hard parts.

- 
Linear reads (databases). You read records in a sequential, ordered stream and checkpoint your position as you go. The crawl is a cursor: simple to reason about, and resumable by remembering where you were. Azure SQL, SQL Server, and Oracle are all this shape.

- 
Graph traversal (file shares, websites, wikis). There's no clean linear order. You're walking a tree or a general graph, and you have to track what you've already visited so you don't re-crawl or loop. Hierarchy, cycles, and "where am I in the walk" all become real problems. File shares, the Enterprise Web connector, and the wiki-style sources live here.

## The connectors, and what made each one its own problem

Connector 
Cloud 
On-prem 
Nature of the crawl 

Azure SQL ✓ linear · database cursor 

Microsoft SQL Server ✓ linear · zero-code-change port of Azure SQL 

Oracle ✓ linear · new queries, everything else reused 

File Share ✓ graph · tree descent + exclusion rules 

Enterprise / Internet Web ✓ ✓ graph · robots.txt + cycle detection 

Azure DevOps Work Items ✓ graph + identity · four-list ACL 

Azure DevOps Wiki ✓ graph + identity · four-list ACL 

Confluence ✓ ✓ graph · handed over to own 

Azure Data Lake ✓ file-tree · handed over to own 

MediaWiki ✓ graph · handed over to own 

Every row above is generally available / in production today. Ten connectors across two environments, three traversal shapes, and four database engines — built, ported, or taken over and owned.

### Azure SQL — the first one, end to end

The first connector I built, and the one I owned all of: low-level design, implementation, getting data into the index, and proving it surfaced correctly on the search page. The premise is that plenty of sites and apps are just a database rendered onto pages, and some companies would rather give Microsoft read access to the database directly than have us scrape the surface. So the connector reads the data in a linear stream, checkpoints, and indexes — cleaner and more complete than crawling the rendered pages. I also contributed to the front-end repo for surfacing it, working inside the framework the FE developers had set rather than owning that framework. Shipped to GA, available to anyone using Microsoft for business. ( Public docs. )

### File Share — the first graph traversal, and the first on-prem proof

Built on-premise, this was the jump from linear to graph: a file share is a tree, and crawling it means descending the hierarchy, tracking where you are, and handling the structure rather than reading a flat stream. It mattered for more than itself — File Share going live in production is what proved the on-prem model was stable, which unlocked the cheap SQL Server and Oracle on-prem wins on the parity page . It's still in GA and powering users. ( Public docs. ) Admins can also exclude unwanted content and file types from a crawl through exclusion rules built into this connector.

### SQL Server on-prem & Oracle — the parity payoff

SQL Server on-prem went live with zero code change (same engine as Azure SQL, just hosted in the customer's data center). Oracle was a new GA connector whose only new code was the database queries. Both are covered in full on the parity page because they're the clearest evidence that the shared-core decision paid off. ( Oracle docs. )

### Azure DevOps Work Items & Wiki — content and identity together

The first connectors built against the access-control charter: they crawl not just the content but the source's permission model, flattening Azure DevOps groups and hierarchies into the four-list identity model the index expects. Both are live in production. The access-control mechanics get their own treatment on the access-control page . ( Work Items docs · Wiki docs .)

### Enterprise / Internet Website connector — graph traversal with adversarial edges

Live on both on-prem and cloud. This is web crawling, with the two classic web problems front and center: respecting and persisting robots.txt so the crawl stays inside what the site permits, and detecting cycles in the web graph so pages that link back to each other don't send the crawler into an infinite loop. ( Cloud docs · on-prem docs .)

### Confluence, Azure Data Lake, MediaWiki — handed over to own

By this point building a connector was "use the framework, write the source-specific code," so connectors others had built were handed to me to maintain, extend, and own the complex live scenarios on. Confluence runs on both on-prem and cloud; Azure Data Lake and MediaWiki rounded out the set. Owning them meant carrying the production support, the live incidents, and the enhancement work on connectors I hadn't written. ( Confluence · Data Lake · MediaWiki .)

## What the breadth actually demanded

The connector code is only half of it. Each connector serves different enterprises with their own use cases, and as the first line of defense for the whole portfolio I was on calls with big clients understanding their workflows and fixing their issues directly — across ten sources, each with its own quirks. That support ran under the two constraints described on the overview (debugging blind, and no undo on-prem), which is what made first-line support for this many sources genuinely hard rather than routine.

Crawl success rate — every connector hitting its success number — was a constant rather than a feature. It's table stakes for a crawler, and it held across the portfolio. The interesting engineering is in the traversal problems above and the platform work on the agent ; the success rate is just the floor all of it had to clear.
