# Replacing the SOAP tool — vendor aggregation

_Section: Yatra — source: /work/yatra/vendor-aggregation.html_

Status: ready 

# Replacing the SOAP tool: an in-house vendor-aggregation service

Topic · Yatra · Bus & Trains team · the system Yatra still routes vendor calls through

## Where bus inventory came from

When a customer searched for a bus, Yatra didn't have the seats — vendors did, and there was more than one of them. Some result needed to be assembled by asking every vendor in parallel, waiting for what came back, and merging it into one list the search page could render. Trains never had this problem: there's exactly one source, IRCTC, so there's nothing to aggregate. Bus was the side with real fan-out, real merging, and real failure modes, and that's where I spent my time.

The fan-out and merge were handled by a third-party tool. You configured each vendor in it, the request went into it, it called the downstream vendors, aggregated their responses, and handed the combined result back. On paper that's exactly the right shape. In practice it was the problem.

## Why the third-party tool had to go

I was told to learn the tool properly, and I did — including a full week of training from the vendor just to understand how it behaved. That week is what convinced me it was the wrong foundation. A few things stacked up:

- It was built on SOAP. By 2016–2017 nobody reached for SOAP anymore; the rest of the world had moved to REST. Every integration carried the weight of a protocol the team was actively trying to forget. 

- It ran on XML transformation and schema mapping. Each vendor's response had to be transformed into the shape Yatra understood, the responses aggregated, and all of it pinned down with hand-written XSD schemas. The logic that mattered lived inside layers of XML, which is a hard place to read, test, or change. 

- It needed a week of training to operate. That's the part that generalizes. A system only one or two people can touch isn't a platform — it's a bottleneck with a license fee. No engineer was going to spend a week ramping on it before they could add a vendor, which meant every vendor change routed back through whoever had done the training. 

I took the case to my manager: the tool was costing more than it saved, and the thing it did wasn't actually hard to do ourselves. It was, in the end, a backend service that fans out, merges, and returns. We could own that. She agreed.

## The design: adapters behind a common interface

I built a new backend Java service that slotted into the same position the tool had occupied: upstream clients call it, it fans the request out to the bus vendors, combines the responses, and returns one merged result. The interesting decision was the inside.

The tool's model — describe each vendor as XML transformations and schemas — is what made it brittle. Given the choice again, I didn't want vendor behavior expressed as data that logic slowly creeps into; I wanted it expressed as code behind a contract . So each vendor became an adapter implementing one common interface . The service knows how to call "a vendor"; each adapter knows how to translate that into the one real vendor it speaks for, and how to turn the reply back into Yatra's model.

The payoff is in onboarding. Adding a vendor stopped being "author a new set of XML transforms and schemas inside a tool you trained a week to use" and became "implement the interface, register the adapter." The hard, vendor-specific part is isolated in one class; everything around it — the fan-out, the merge, the timeouts — is shared and untouched. A new vendor can't destabilize the existing ones, because it can't reach past its own adapter.

### Keeping search fast when a vendor isn't

Fan-out has an obvious failure mode: the slowest, sickest vendor sets the speed of the whole search. If one vendor is down or crawling, you don't want every customer's search waiting on its timeout. So I wrapped the vendor calls in Hystrix circuit breakers : when a vendor fails past a threshold within a window, its breaker opens and the service stops calling it for a while, routing to the other vendor instead. A degraded vendor takes itself out of the path automatically and the search page stays fast — the failure is contained to the vendor that's actually failing, not paid for by every search.

[diagram: Diagram of the aggregation service. At the top, an Upstream clients box (a bus search request) points down into a large box labelled In-house aggregation service in Java, which fans out, merges, and exposes one common vendor interface. Inside it sit two adapter boxes: Adapter A, which implements the interface and whose Hystrix breaker is closed because its vendor is healthy, and Adapter B, which implements the same interface but whose Hystrix breaker is open because its vendor is failing. A note reads that a new vendor onboards by implementing the same interface and registering, with no service change. Below, Adapter A points with a solid arrow to Vendor 1, which is responding normally, while Adapter B's link to Vendor 2 is a dashed broken line labelled breaker open, with Vendor 2 marked down or slow and skipped.] 

Each vendor is one adapter behind a shared interface; a failing vendor's breaker opens and the request routes around it, so one sick vendor can't slow every search.

## What it changed

The service went live and became the path Yatra makes its vendor calls through — it was still doing that when I left, and as far as I know long after. Replacing a licensed third-party tool with an in-house service you fully control is the obvious win, but the one I'd point to is the adapter boundary. It turned "onboard a vendor" from a specialist task gated on a week of training into something any engineer on the team could do by implementing an interface. That's the difference between a system that depends on the person who understands it and a system the team can carry — and making that shift, on live search traffic, without a protocol everyone hated underneath it, is the work I'm proudest of from this team.
