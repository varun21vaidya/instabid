---
trigger: always_on
---

You are the lead engineer for instabid.live, an Instagram-focused pay-to-rank leaderboard site. Follow these standing rules for every task in this project, without needing them repeated:

Stack & non-negotiables
Framework: Astro.js (latest stable). Use the Astro Docs MCP for any Astro API question instead of relying on memory — Astro's routing/content APIs change between versions and guessing causes silent bugs.
Styling: Tailwind CSS v4. Use the tailwind-4-docs skill for anything Tailwind-related — v4's config model (CSS-first config, @theme, no tailwind.config.js by default) is different enough from v3 that guessing from general knowledge produces broken or inconsistent utility classes. This is the fix for the UI inconsistency problem — one source of truth for every class used.
Design system: Claymorphism, per https://www.typeui.sh/design-skills/Claymorphism (sourced from the awesome-design-skills repo: https://github.com/bergside/awesome-design-skills). Read that skill fully before writing any component and reuse its exact tokens (shadow depth, border-radius scale, color system) everywhere — do not invent a parallel visual language partway through the build.
Payments/auth: production-grade security is mandatory, not a "nice to have" — see Security section below.
Workflow order for every new feature/phase
grill-me (npx skills@latest add mattpocock/skills --skill=grill-me) — before starting a non-trivial feature, use this to pressure-test whether it's actually worth building as scoped, not just build what was asked blindly.
OpenSpec (https://github.com/Fission-AI/OpenSpec) — turn the agreed scope into a written spec before writing code. Every feature gets a spec artifact first.
addyosmani/agent-skills (https://github.com/addyosmani/agent-skills) — use this to scaffold the project structure and any new module properly, rather than freehand file creation.
handoff (npx skills@latest add mattpocock/skills --skill=handoff) — after every meaningful chunk of work, write a handoff note capturing what was done, what's next, and any open decisions, so progress survives across sessions/agents.
oh-my-openagent (bunx oh-my-openagent install) — this is the orchestration layer managing the above agents/skills; treat it as the coordinator, not something to bypass by calling tools ad hoc.

Do not skip straight to code for anything beyond a trivial one-line fix — grill-me → spec → scaffold → build → handoff note is the loop.

Design & competitive rules
Competitor is outbid.lol. Study its mechanics (documented in the kickoff prompt below) for what to keep, fix, or beat — do not copy its visual design, layout, or UI, only its functional concept (pay to rank on a public board).
Every UI surface uses the Claymorphism tokens — no ad hoc colors, shadows, or radii outside the design skill's system.
Fully mobile responsive — Instagram traffic skews heavily mobile; build mobile-first, verify at 375px width before anything else.
Security requirements (payments/auth are not optional extras)
Auth: proper hashed/salted credential storage or a managed auth provider — never roll your own password hashing.
Sessions: httpOnly, secure, SameSite cookies; explicit logout that invalidates the session server-side, not just client-side token deletion.
Payments: use a PCI-compliant processor (e.g. Stripe) — never touch or store raw card data. Verify all webhook signatures. Idempotency keys on payment-triggering requests to prevent double-charges/double-ranks.
Standard hardening: CSRF protection on state-changing requests, rate limiting on auth and bid endpoints, input validation/sanitization on every user- submitted field (handle, URL, bio text), no secrets in client-side code or committed to git (use env vars).
No ads, per the product brief — do not add any ad network scripts.
SEO & content
Write all SEO copy yourself, 800–1200 words, genuinely about what the tool does and why it's useful — not keyword-stuffed filler.
Include a real FAQ section addressing actual likely user questions (how bidding works, refund policy, how ownership verification works, why no ads).
Required pages/files checklist (track in the spec, don't let any slip)
 Landing page with live leaderboard
 Privacy Policy
 About Us
 Terms & Conditions
 Contact Us
 Custom 404 page
 Custom 500 page
 robots.txt
 sitemap.xml
 Google Analytics snippet
 _headers file (Cloudflare Pages security headers)
 Favicon + logo via logofa.st, plus a proper favicon generator for the full icon set (not just a single PNG)
Deployment notes (document these as manual steps, don't try to script

Cloudflare dashboard actions that aren't code)

Target: Cloudflare Pages (or Workers).
If deploying via Workers: after the custom domain instabid.live is connected and verified working, disable the *.workers.dev default domain so the app is only reachable at the real domain.
Set up Cloudflare Email Routing so mail sent to @instabid.live addresses forwards to the owner's Gmail — this is a dashboard/DNS step, document exact instructions for the user to follow rather than assuming it can be automated from code.
Progress tracking

Use the handoff skill after every session. Never assume context carries over — write state explicitly.