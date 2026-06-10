# Platform scope & role

_Section: Intuit · Notifications Platform — source: /work/intuit/platform-overview.html_

Status: ready 

# Intuit — the Notification Platform

Mar 2024 – Present · Customer Communications

## What the platform is, and what this page is for

Intuit's Notification Platform is the company-wide system every product team — QuickBooks, TurboTax, Credit Karma, Mailchimp, ProSeries, Lacerte, plus several internal product surfaces — uses to deliver transactional and marketing notifications across email, SMS, RCS, voice, push, and the in-product tray. It carries traffic in the tens of millions of messages per day at peak and is on the user-visible path: a regression on this platform is a regression the customer sees.

The work below is five distinct chapters, each with its own topic page in the left nav. They sit at different shapes of ownership — lead engineer on one, solo build on another, platform owner on a third, capability owner, post-handover steward — and that variation is the point. The Staff signal isn't a single label that applies to all of them; it's the through-line of taking different ownership models seriously and shipping each one on the terms the work actually had.

Underneath the five chapters is a different layer: how I operate across all of them. That's the second half of the page.

## Five workstreams

### 1. Notification Authoring Portal — redesigning the authoring stack (lead engineer, ~13 months) 

The Notifications Authoring Portal — the surface every product team uses to configure email, SMS, voice, RCS, push, and tray notifications — was built on a single database trying to serve two opposite workloads at once: authoring (ACID, joins, schema evolution) and delivery (2,000+ TPS, denormalized, zero joins). Every schema change in one direction broke the other. I led the redesign that decoupled the two: a new authoring data model and service path that doesn't share a database with delivery, a parity layer that compared every read on the new path against the legacy path before traffic moved, and a phased migration that ended with 100% of authoring traffic on the new stack before the tax peak the platform had to carry. The full architecture, the parity-vs-hope decision, and the migration shape are on the topic page.

### 2. Notifications Platform Search — full-text discovery over the catalog (solo build, in production, zero incidents) 

The platform's configuration catalog — roughly 10,000 notifications authored by people across many teams, many of whom have moved on — lived in a database built for point queries and could not answer the two questions the team kept getting paged on: "who configured this?" and "who's the author of this notification?" during an incident. I built the full-text search path solo: change-data-capture from the catalog tables into a streaming pipeline, an indexed store optimised for the query shape, and the API that fronts it. In prod since I shipped it, zero incidents on that path, still the only way the team answers those questions today.

### 3. Notification Tray — platform ownership of the in-product inbox (lead and single point of contact since 2024) 

The Notification Tray is the in-product inbox in QuickBooks, TurboTax, Mailchimp, and a few internal product surfaces — the bell-and-badge surface multiple teams want to drop messages into. I'm the lead and single point of contact: consumer teams come to me to integrate, I own the reliability story, and I'm the one pushing on where the storage layer should go next. The storage today is a multi-region wide-column cluster with a separate search index — a stack that works but doesn't get future investment from the vendor in the shape we need. The proposal to migrate off it onto a managed store is documented, scoped, and currently waiting on funding; that's stated honestly on the topic page rather than as executed work.

### 4. RCS — building a two-way messaging capability on the platform (capability owner) 

Two product teams arrived wanting two-way conversation flows over a low-touch surface, the kind of interaction that fits a native messaging client better than an authenticated webapp. The work that came out of that wasn't really "build the RCS channel" — it was adding a two-way capability to the platform with RCS as the first bearer it carries. The pre-existing inbound service captured consent and firehosed every reply onto a single shared topic; I redesigned it so the broker handles per-consumer routing by header, which means a new consumer team onboards by creating a topic and requesting a routing rule rather than asking platform engineering for a code change. SMS replies now ride the same capability as the second bearer.

### 5. SMS — adoption, two-way, and the on-call seat (post-handover steward) 

SMS came to me after the outbound path was already stable — high-volume sign-in OTP traffic running at the success rate the company depends on for login. My chapter is what came after that: onboarding six to seven high-volume consumer teams onto the channel (sender procurement, carrier registration, consent wiring), adding two-way SMS as the second bearer onto the inbound capability the RCS work introduced, releasing OTP localization without a regression on the highest-volume traffic on the channel, and being the primary incident commander when sign-in success rate degrades and someone has to make the vendor switch.

## How I operate across the five

Underneath the five workstreams there's a steady operating posture that the topic pages each touch but none of them really name. It's the second half of what the role looks like in practice.

- 
Cross-org integration surface. Partner teams across 10+ products who can't tell whether a missing notification is upstream, the platform, or the vendor land with me first to disambiguate. The disambiguation is half the work — knowing which logs to pull, which dashboard tells the truth, which team owns the next hop — and it's the part that doesn't show up in any individual workstream because it spans all of them.

- 
Tax-peak owner for the services I run. Both tax seasons during this period closed with the services I own holding zero 5xx through the window. That's not a coincidence — it's pre-peak load testing, capacity reviews, runbook prep, and the night-shift coverage the season needs. The seasons that go quietly are the ones that got the most preparation; the ones that don't get the prep are the ones that page the rest of the org.

- 
Vendor-switch incident commander. When SMS sign-in success rate degrades, the pager goes to me. The call — mitigate by switching to the secondary, or hold and wait for the vendor — runs in parallel with vendor escalation; I've described the trade-off on the SMS page. The decision window has shrunk because the same person has run the call enough times to know where it usually breaks.

- 
Migrate, don't patch, when the patch budget exceeds the migration budget. Made this call publicly on the Tray storage proposal, drove it on the authoring stack, and pushed for retiring the legacy scheduling service before tax peak. Each removed a chronic failure source rather than adding another layer of guardrails on top of one.

- 
Parity over hope on migrations. The decoupling of the authoring stack worked because every read on the new path was compared against the legacy path before traffic moved. That comparator pattern is now the team's default for "we're going to change a system that already has traffic."

- 
Escalate when peer-level chatops stalls. When the messaging-infrastructure team wouldn't approve cross-asset routing to prod — blocking two consumer-team integrations — I escalated in the platform leaders forum, got manager contacts, scheduled the cross-team conversation myself, and negotiated the prod rollout timeline. Politeness past a certain point is just letting a partner team stay blocked.

- 
Demonstrate before proposing. Rather than write a doc to argue for a home-page redesign, I generated previews of every production notification through the new preview API and hosted the visual mockup. The proposal landed because the evidence was already there to look at, not because the doc was persuasive.

## Recognition

Peer recognition — Spotlight award citations from senior leadership and cross-org partners, including the two highest-tier (Bravo and Salute) awards — is collected on the Recognition page in the left nav. The citations cover the tax-peak owner work, the channel launches, the cross-org integration partnership, and on-the-ground incident leadership.
