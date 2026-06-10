# Access control — mapping every source onto one identity model

_Section: Microsoft · Graph Connectors — source: /work/microsoft/access-control.html_

Status: ready 

# Access control: mapping every source onto one identity model

Topic · Microsoft · Graph Connectors · identity crawl

## Why a crawler has to crawl permissions too

The earlier connectors indexed content and stopped there. That's fine until you remember what the index feeds: enterprise search. If a connector crawls an internal source and indexes everything it finds, then anyone who searches can surface documents they were never allowed to open in the source system. A crawler that ignores permissions isn't just incomplete — it's a data-leak path. So the charter for the next wave of connectors was to add access control, and to do it the way the index actually enforces it.

## The hard part: every source models permissions differently

There is no shared permission language across the systems we crawl. One source thinks in users and groups; another adds nested groups; another layers permissions down a hierarchy of projects, areas, and items, with inheritance and overrides. The index, on the other hand, understands exactly one model, and every item has to arrive expressed in it.

That model is four lists per item:

- Allowed users 

- Allowed groups 

- Denied users 

- Denied groups 

So the connector's job is a translation problem: take whatever the source natively expresses — Azure DevOps groups, hierarchies, inherited permissions — and flatten it correctly into those four lists, with denies winning over allows the way the source intends. Get the flattening wrong in the permissive direction and you've leaked; wrong in the restrictive direction and the content is invisible to people who should see it. Neither is acceptable, so this is one of the places the no-room-for-error bar bit hardest.

## Two crawls, not one

The clean way to handle this turned out to be separating it into two distinct sync types rather than bolting permissions onto the content crawl:

- Content sync — crawl the actual data: the work items, the wiki pages, the documents. 

- Identity sync — crawl the access-control graph: the users, the groups, the hierarchy and its inheritance, pushed to the index so it knows who maps to what. 

Separating them matters because identity and content change on different rhythms and at different scales, and because the index needs the identity picture to make sense of the ACLs riding on each content item. My responsibility wasn't building the identity framework that consumes all this — it was building the connectors that crawl both sides from each source and produce the four-list model the framework expects.

## Where it shipped: the Azure DevOps connectors

Azure DevOps was the proving ground because it has real permission complexity — groups and hierarchies that genuinely have to be flattened rather than copied across.

- 
Azure DevOps Work Items — the first connector to go live with the identity-aware model. It crawls work items as content and the project's permission structure as identity, and emits items carrying the four lists. ( Public docs. )

- 
Azure DevOps Wiki — built on the same lines and also live in production, applying the same content-plus-identity treatment to wiki pages. ( Public docs. )

## Why this one carried weight

Access control is the feature that makes enterprise indexing safe to sell. A connector that respects the four-list model can index a company's internal source knowing search results will mirror exactly what each person can already see — no more, no less. Getting the Azure DevOps connectors live against that model meant the permission-flattening pattern was proven on a genuinely complex source, which is what later identity-aware connectors leaned on. And of everything in the portfolio, this is the work where being right mattered most: an access-control mistake either leaks a document or hides it, and under the debugging constraints on the overview you can't catch it by reading the data afterward — so the model has to be correct by construction.
