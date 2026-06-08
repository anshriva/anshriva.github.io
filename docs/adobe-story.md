# Adobe — source story (raw)

This is the source of truth for the Adobe section of the portfolio, captured from the user's own telling. Build pages only from what is recorded here. No fabricated metrics — only quantities the user actually states.

## Role envelope (confirmed)

- **Adobe** — joined **fresh out of college on 23 June 2014**.
- Team on joining: **Engineering Security team**.
- Role: **SDE-1 throughout — never promoted at Adobe.**
- **End date: August 2016** (left Adobe; joined Yatra Sep 2016).

## Chapter 1 — Centralizing code signing (the signing service / portal)

The Engineering Security team had several responsibilities; the user's work was mostly around the **code signing of builds that ship outside of Adobe**.

The core asset: a **private key** used to sign any build that goes out — Mac builds, Windows `.exe`/installers, and several other kinds: **JAR signing, ZIP signing, etc.** Every shipped build needs a valid code signature so that when someone installs it on their machine, it shows the publisher as **"Verified — Adobe Systems."**

**The problem being solved — decentralized keys.**
- Earlier, **different teams each held this private key** themselves.
- This team's job was to **remove all those scattered private keys** and move to **centralized storage for all the private keys**, where **only production systems** were allowed to access them.

**What was built — a signing portal + pipeline.**
- A **portal** where users **submit a build and the list of files to be signed**.
- **An approval step**: somebody has to **approve** the signing of the build.
- Then the **pipeline runs**, **signs the build**, and delivers the **signed build to a given path**.
- Mechanics: the files were placed in an **FTP location**; the portal **fetched from that FTP location** and performed the signing.

## Chapter 2 — SDE-1 build-out work on the signing service

As a **fresh-out-of-college SDE-1**, the user was **not the architect/lead** here — responsible mainly for **enhancement and coding as directed by the leads**. The concrete pieces built/owned:

- **`.zxp` signing** — implemented a new kind of signing (ZXP is the Adobe extension/add-on package format).
- **Integration-test framework** — built a framework to test signing scenarios like the above.
- **Retrial scripts** — added retry handling for when code signing fails.
- **FTP library** — built an FTP lib so the code to download content from FTP lived in **one place**, and cross-cutting concerns like **read timeouts** could be handled centrally.
- **REST API SDK** — enhanced the REST API SDK for the service so clients could consume it.

## Scope, honestly

This was the user's **first job out of college**. Beyond the pieces above, the rest was **bug fixing, keeping the signing pipeline running, and working closely with the customer teams** consuming the service. The user's own framing: **not much innovation — more of a maintenance mode.** No other big bucket of work to draw on.

## Story status: COMPLETE

The only concrete, non-fabricated facts to build from:
- Joined fresh out of college, **23 June 2014**, **Engineering Security team**, role **SDE-1**.
- Team mission: **centralize all code-signing private keys** out of individual teams into central storage accessible only by production systems.
- Built/owned: the **signing portal** (submit build + file list → approval → pipeline signs → delivers to a path; files staged via FTP); **`.zxp` signing**; an **integration-test framework**; **retry scripts** for failed signings; a **shared FTP library** (centralized downloads + read-timeout handling); **REST API SDK** enhancements.
- Signature result: builds show publisher **"Verified — Adobe Systems"** across Mac, Windows, JAR, ZIP, ZXP.
- Not the architect/lead — enhancement + coding as directed by leads; remainder was maintenance and customer support.

### Open facts to confirm with user (role envelope)
- **End date** at Adobe / how long the tenure was. (Title is settled: SDE-1 throughout, no promotion.)

### Page structure built (1 page, confirmed with user)
1. `work/adobe/overview.html` (adobe-overview) — single page covering team mission (key centralization), the signing portal + pipeline, the SDE-1 build-out (zxp, integration-test framework, retry scripts, FTP lib, REST SDK), and the honest maintenance-mode scope. Nav title: "Centralizing code signing".


