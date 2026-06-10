# Booking-health alerting

_Section: Yatra — source: /work/yatra/booking-observability.html_

Status: ready 

# Booking-health alerting, before Yatra had alerting

Topic · Yatra · Bus & Trains team · first project, and the gap nobody owned

## The dashboard, and what it couldn't do

One of the first things I was given after the onboarding bugs was a dashboard: bookings per hour across bus and trains, plus a handful of related metrics, for the product managers and engineers who needed to know the business was flowing. It read from the service that already held the booking data, pulled the numbers, and drew them. The backend was Java; the frontend was ExtJS — an old framework even then, but what the team used, so that's what I learned and built in.

Once it was running I noticed the thing dashboards can't fix about themselves: someone has to look. Bookings are a heartbeat — if they stop, you want to know in minutes, not whenever a person next happens to open a browser tab. And nobody opens the tab every hour. A drop could sit unseen for half a day, which on a booking platform is real lost revenue and usually a real bug upstream. The dashboard answered "how are we doing?" only if you asked. The question that mattered was the one nobody was awake to ask at 3am.

## No tooling to lean on

Today the answer is "wire it to your alerting stack." Yatra didn't have one — no Splunk, no Graylog, none of the log-and-alert infrastructure that would make this a five-minute config change. There was nothing to point at the booking stream and say "page me when this dips." If booking-health monitoring was going to exist, it had to be built, not configured. So I built it into the same observability service that backed the dashboard — the data was already there; what was missing was something that watched it on its own.

## What I built

Two scheduled jobs, both running inside the observability service, both turning data that already existed into something that reached a human without a human asking.

- 
Hourly booking-health check. A scheduler runs every hour, looks at the last hour's bookings, and if there were none — or fewer than a threshold — sends an email describing the breaking scenario: which segment, how far below normal, when. That's the alert that turns a silent dip into a notification while it's still an hour old instead of a day old. Email was the channel because email was the channel that existed; the point wasn't the transport, it was that the system noticed on its own.

- 
Daily morning digest. A second scheduled job sends a morning email with the previous 24 hours: bookings completed, number of searches, and a few more metrics. Not an alarm — a standing pulse, so the team starts the day knowing the shape of the night without logging into anything.

## Why a "small" feature is the right one to start with

On its face this is a scheduler and two emails. What it actually did was give the team a sense the platform didn't have before: the booking pipeline could tell you when it was sick instead of waiting to be checked on. Building it is also where the habit that runs through the rest of my time at Yatra started — I wasn't asked to add the alerting or the digest; I noticed the dashboard left a gap that no one owned, and filled it. The hourly alert and the morning pulse were the version of observability you can build with no observability platform underneath you, which was the only version available at the time.
