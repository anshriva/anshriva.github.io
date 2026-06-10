# Bus, trains & the booking platform

_Section: Yatra — source: /work/yatra/overview.html_

Status: ready 

# Yatra Online — bus, trains, and the booking platform underneath

Sep 2016 – Mar 2019 · Gurgaon · Software Engineer → Senior Software Engineer (promoted 2018) · two teams

## What this is, and what these pages cover

Yatra is one of India's larger online travel companies — flights, hotels, buses, trains. I joined in September 2016 on the Bus & Trains team and spent most of my time on the bus side, where the interesting systems problem lived: buses have many vendors to source inventory from, trains have exactly one (IRCTC), so the bus side is where routing, aggregation, and failure-handling actually mattered. In 2018 I was promoted to Senior Software Engineer and moved to the team rebuilding the booking data platform, where I owned the bus and train slices of a live database migration.

The chapters below each have their own page in the left nav. The through-line across both teams is the same: take a brittle system someone bolted together years earlier — a third-party SOAP tool, a 3,000-line stored procedure, a dashboard nobody remembers to open — and replace it with something an engineer can actually reason about and extend.

The surface area over two and a half years looked like this:

- Bus multi-vendor aggregation 

- Adapter-based supplier onboarding 

- Hystrix circuit breakers 

- Booking-health alerting (pre-Splunk) 

- Daily metrics digest 

- B2B trains rebuild (JSP/Tiles) 

- In-memory Trie autosuggest 

- MS SQL → PostgreSQL migration 

- Live change pipeline 

- MongoDB denormalized read model 

It also spanned more layers than the title suggests: I came in as a backend Java engineer and ended up self-teaching the frontend stack (ExtJS, then JSP with Tiles) when a rebuild needed both halves done.

## The chapters

### 1. The vendor-aggregation service — replacing the SOAP tool (the one that outlived me) 

Bus inventory came from multiple vendors, fanned out and aggregated by a third-party tool built on SOAP — already a decade out of fashion by 2017, and so opaque it took a week of vendor training just to operate. I proposed and built an in-house Java service to replace it: vendors behind a common interface, a new one onboards by implementing the interface and registering, no XML/XSD transformation tangle. Hystrix circuit breakers short-circuit a vendor that's failing so search stays fast. It went live and Yatra has used it for vendor calls ever since. The vendor-aggregation page walks through it.

### 2. Booking-health observability — alerting before Yatra had alerting (first real project) 

I built (really, rebuilt) the dashboard that tracked bookings per hour across bus and trains for product and engineering. The insight that made it useful: nobody watches a dashboard every hour, so a drop in bookings goes unnoticed until it's a problem. I added a scheduler that checks each hour and emails an alert when bookings fall below threshold, plus a daily morning digest of bookings and searches. This was before Yatra had Splunk or Graylog — there was no tooling to lean on. The observability page has the detail.

### 3. The B2B trains rebuild — a legacy gut job, backend and frontend (full-stack, self-taught) 

The B2B "My Bookings" page for trains — used by travel agents — ran on a backend from Yatra's earliest days, with methods 2,000–3,000 lines long and a JSP frontend on the same service. I pitched a full rewrite, my manager said go, and I rebuilt the backend carrying only the code that was still used, then learned the frontend stack to rebuild that half too, with print-e-ticket, email, and SMS features. Shipped to production. The B2B rebuild page covers it.

### 4. The booking data-platform migration — MS SQL → Postgres, live (Senior SE; execution under an architect's design) 

On the second team I owned the bus and train slices of migrating the booking database off Microsoft SQL Server — where a third-party tool generated thousands of lines of stored procedures — onto in-house PostgreSQL, with a MongoDB read model for fast lookups. The hard part was doing it live: new bookings kept arriving, so a change pipeline replayed every write into the new store within a second or two. An architect designed the system; I implemented the pieces. The data-migration page has the honest scope.

One smaller piece doesn't get its own page: I added city-name autosuggest to the search page. The city list was small (~10,000) but changed over time, so the source of truth stayed in the database and the whole set was loaded into an in-memory Trie for fast prefix lookups — fast typeahead without hammering the data source on every keystroke.

## How the role changed

The promotion in 2018 wasn't a title bump with the same job underneath. The work changed shape across the two teams.

- 
Started by getting comfortable. Bugs and small fixes first, to learn the codebase — then the booking dashboard, which is where I started noticing the gaps nobody owned (no alerting, no digest) and filling them without being asked.

- 
Became the person who owns the vendor integration. I was told to learn the third-party aggregation tool deeply, and I did — a week of vendor training — and that depth is exactly what told me it shouldn't be a third-party tool at all. Proposing and building the replacement was the shift from "fix what's assigned" to "decide what should exist."

- 
Then a Senior SE on a platform migration. On the new team the design belonged to an architect and my job was execution at depth — owning the bus and train data, standing up Kafka topics, tables, and a new database against that design, and getting a live cutover right without losing in-flight bookings.

## The constraint that ran underneath all of it

Travel booking has no quiet window. The systems above were all live — real bookings, real money moving — while I was changing them. There was no maintenance mode to migrate a database in, no second dashboard to fall back on, no spare vendor to absorb a bad cutover. So the recurring shape of the work was the same: replace a load-bearing piece underneath live traffic, and make the replacement boring enough that nobody downstream noticed the swap. The vendor service, the database migration, the dashboard rebuild — each one was a live-system change first and a feature second.
