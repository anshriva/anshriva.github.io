# The B2B trains rebuild

_Section: Yatra — source: /work/yatra/b2b-bookings.html_

Status: ready 

# Gutting a legacy page: the B2B trains rebuild, both halves

Topic · Yatra · Bus & Trains team · backend rewrite + a frontend I had to learn

## The page, and the code under it

Travel agents and other business customers had their own "My Bookings" view for trains — where they'd pull up a booking, reprint a ticket, resend a confirmation. The page worked. The code behind it was from Yatra's earliest days and showed it: a backend with methods 2,000 to 3,000 lines long , and a JSP frontend served off the same service. Methods that size aren't functions anymore; they're sediment. Years of changes had piled into them, and a large share of what was there was no longer called by anything — dead branches you couldn't safely delete because nobody could tell what still mattered.

Nothing was on fire. That's exactly why this kind of code survives: it runs, so it's nobody's emergency, and it quietly taxes every change anyone tries to make near it. I asked my manager whether I could just rebuild the whole thing rather than keep patching around it. She said go ahead.

## The rewrite — keep what's used, drop the rest

I wrote a new backend service and treated the old one as a reference to read, not a thing to port. The discipline was to carry over only the code that was actually important and still in use, and to leave the thousands of lines of dead legacy logic behind. A rewrite is only worth doing if the result is smaller and legible; copying the 3,000-line methods into a new file would have just moved the problem. So the new service did what the page genuinely needed, in code you could read top to bottom, and nothing else.

### Learning the frontend to finish the job

The catch: the page was backend and frontend on the same service, and the frontend was JSP. I was a backend engineer — I hadn't done frontend work. But rebuilding only the backend would have left the page half-migrated, still tied to the old frontend, which defeats the point. So I onboarded myself onto the frontend stack: JSP, and the view concepts around it like Tiles for composing the layout. Then I rebuilt the page itself — a clean B2B "My Bookings" for trains — on top of the new backend.

With both halves rebuilt, I wired in the things agents actually use day to day: print e-ticket , send the ticket to my email , and send it over SMS . Then it went live on production.

## What it demonstrates

The visible result is a working B2B bookings page that's now maintainable instead of frightening. The part worth naming is the willingness to take the whole thing — backend and a frontend stack I didn't know — rather than do the comfortable half and hand off the rest. Recognizing that the old methods were mostly dead weight, choosing to carry only what was live, and learning JSP and Tiles well enough to ship the frontend myself is the same instinct that shows up elsewhere in my time here: when a system is brittle because of how it was built, the fix is usually to rebuild it smaller, not to keep negotiating with it.
