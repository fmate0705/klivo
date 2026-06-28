# CLAUDE.md — Premium Web Project Constitution

> Drop this file in the root of any new web project folder, then open Claude Code in that folder.
> This file is read automatically by Claude Code at session start. It is the **single source of
> truth** for how this project is designed, built, structured, and shipped.

---

## ⚠️ READ THIS FIRST — Setup status of tools referenced below

This file references two categories of tooling:

1. **Verified, real, installable today** — confirmed against current docs at time of writing:
   the built-in `frontend-design` skill, the **Chrome DevTools MCP**, and the **21st.dev Magic MCP**.
   Exact install commands are given in `## MCP Setup`.
2. **Placeholder slots** — you mentioned several skill names (e.g. "UI/UX Pro Max", "taste skill",
   "Emil Kowalski Design skill," "Web Design Guidelines," "Brand Kit skill," "Superpowers skill,"
   "Code Review Skill," "Git Workflow Skill," "SEO skill," "Next.js SEO skill") that are **not
   verifiable built-in Claude skills** — they may be community skills you've found, custom skills
   you intend to write, or names from a video/course. Rather than have this file confidently
   reference tools that may not exist on your machine and silently do nothing, every one of these
   is listed in `## Skill Roster` as a **named slot** with its trigger condition and expected
   folder location. **Before first use, open `.claude/skills/` and confirm which slots actually
   have a `SKILL.md` in them.** Empty slots are skipped automatically — see the Skill Resolution
   Protocol below. This keeps the file honest: it will not claim to use a skill that isn't there.

Claude Code: at the start of every session, run the Skill Resolution Protocol (below) before
doing anything else.

---

## 0. Skill Resolution Protocol (run this first, every session)

```
1. List the contents of .claude/skills/ (project-level) and ~/.claude/skills/ (user-level).
2. For every skill named in the Skill Roster below, check if a matching folder/SKILL.md exists.
3. Build an internal map: { skill_name: "available" | "missing" }.
4. Never claim to have used a skill that resolved to "missing."
5. If a "missing" skill is on the critical path for the current task (e.g. no frontend-design
   skill at all), tell the user once, briefly, and proceed using the best available substitute
   (your own design judgment, following the Design Doctrine in this file).
6. Do not re-announce missing skills on every turn — mention once per session, then proceed.
```

This protocol exists so the project degrades gracefully. A missing "taste skill" should never
block work — it should just mean Claude leans more heavily on the explicit Design Doctrine
written into this file.

---

## 1. Project Philosophy

This is not a prototype factory. Every project built from this file is treated as a real,
client-deliverable, production-bound product from line one. That means:

- **No placeholder code that ships.** Lorem ipsum, "TODO," fake API responses, and `console.log`
  debugging are fine *during* work but must not exist in a final commit.
- **No throwaway folder structures.** The structure chosen on day one is the structure the repo
  keeps. Restructuring later is expensive — decide once, decide well (see `## 3`).
- **Premium means restrained, not decorated.** A premium site is not one with the most
  animation, gradients, or components — it's one where every choice was made on purpose and
  nothing is fighting for attention. Read the Design Doctrine before writing any UI code.
- **Docker is not optional.** Every project, regardless of size, runs in Docker. A reviewer or
  client should be able to clone the repo and run one command. See `## 4`.
- **Documentation is a deliverable, not an afterthought.** `/docs` is generated as the project
  is built, not bolted on at the end. See `## 7`.
- **SEO and AI-discoverability are baseline requirements, not a final-week task.** See `## 8`.

---

## 2. How Claude Code Should Operate on This Project

### 2.1 Skill & MCP usage rule — **use only what the task needs**

Do **not** invoke every skill or MCP on every task. Each tool below has an explicit trigger.
Match the trigger to the current request; if it doesn't match, skip the tool silently — don't
narrate which tools you're skipping.

| Situation | Use |
|---|---|
| Designing or restyling any visible UI (new page, new component, redesign) | `frontend-design` skill |
| Need to visually verify rendered output, debug layout/console/network issues, check performance | Chrome DevTools MCP |
| Need a ready-made, on-brand UI component generated fast (forms, nav bars, cards, pricing tables) | 21st.dev Magic MCP (`/ui` command) |
| Writing or reviewing any production code | Code Review slot (if present) + your own rigor — see `## 5` |
| Committing, branching, opening PRs | Git Workflow slot (if present) + Git Conventions in `## 6` |
| Building any public page that should rank or be cited by AI systems | SEO doctrine in `## 8` (+ SEO/Next.js SEO slots if present) |
| Starting a brand-new project with no existing visual identity | Brand Kit slot if present, otherwise establish tokens yourself per Design Doctrine |
| Multi-step task needing decomposition, parallel exploration, or rigorous self-checking | Superpowers slot if present, otherwise plan explicitly in your own reasoning before coding |

### 2.2 General behavior rules

- Before writing any UI code: state the design plan (palette, type, layout concept, one
  signature element) in 4–6 lines, then build. This mirrors the `frontend-design` skill's
  brainstorm-then-build process even when invoked implicitly.
- Before scaffolding a new project: ask only the questions that change the folder structure
  (see `## 3.1`). Don't ask about things you can reasonably default (e.g. don't ask "what color
  scheme" if no brand info exists — make a deliberate choice and state it).
- After any nontrivial feature: update `/docs` and `/.claude/memory/progress.md` (see `## 9`)
  in the same turn — not "I'll do it later."
- Never leave a page half-styled. If you scaffold a route, it ships with real layout, spacing,
  and type — not unstyled HTML "to be designed later."
- Treat accessibility as part of "premium," not an add-on: visible keyboard focus, semantic
  HTML, sufficient contrast, reduced-motion support are required on every page, every time.

---

## 3. Project Structure Decision Tree

Claude Code must **choose the right structure for the actual project**, not force every project
into the same shape. Before scaffolding, classify the project using this decision tree.

### 3.1 Classification questions (ask only if not inferable from the user's request)

1. Does this site need user accounts / auth?
2. Does this site need to send email (transactional, marketing, contact forms)?
3. Does this site need a database, or is content fully static?
4. Is this a single marketing/landing page, a multi-page marketing site, or an app-like product?

If the user's initial prompt already answers these (e.g. "landing page for my bakery" implies
no auth, no DB, static content), **don't ask — infer and state the assumption.**

### 3.2 Structure tiers

**Tier 1 — Static / Landing Page** (no auth, no DB, no email beyond a simple contact form via a
third-party form endpoint)

```
project-root/
├── CLAUDE.md
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── next.config.js              # or vite.config.ts, framework-dependent
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── llms.txt
│   ├── manifest.json
│   ├── .well-known/
│   │   └── security.txt
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── app/                    # or pages/, framework-dependent
│   ├── components/
│   │   ├── ui/                 # primitive, reusable components
│   │   └── sections/           # page-section-level components
│   ├── lib/
│   │   ├── seo.ts              # metadata + JSON-LD helpers
│   │   └── utils.ts
│   ├── styles/
│   └── content/                # copy, MDX, or CMS-adjacent content
├── docs/
└── .claude/
    ├── skills/
    └── memory/
        └── progress.md
```

**Tier 2 — Dynamic Marketing Site** (multi-page, blog/CMS, RSS feed, contact form with real
email sending, no user accounts)

Adds to Tier 1:

```
├── src/
│   ├── app/api/contact/route.ts
│   ├── app/feed.xml/route.ts   # RSS
│   └── lib/email.ts            # transactional email client
├── docker-compose.yml           # add a mail-catcher service for local dev (e.g. Mailpit)
```

**Tier 3 — Full Application** (auth, database, email flows, possibly payments)

Adds to Tier 2:

```
├── docker-compose.yml           # app + db + mail-catcher + (redis if needed)
├── prisma/  (or drizzle/)
│   └── schema.prisma
├── src/
│   ├── app/api/auth/[...]/route.ts
│   ├── app/(auth)/login/
│   ├── app/(auth)/register/
│   ├── app/(dashboard)/        # gated app routes
│   ├── lib/auth.ts
│   ├── lib/db.ts
│   └── middleware.ts           # route protection
├── .env.example                 # DATABASE_URL, AUTH_SECRET, SMTP_*, etc.
```

Claude Code must state which tier it has selected and why, in one sentence, before scaffolding.

---

## 4. Docker Requirement — Non-Negotiable

**Every project, every tier, runs in Docker.** A developer or reviewer with nothing but Docker
installed must be able to run:

```bash
docker compose up
```

and get a fully working local instance — correct port, hot reload in dev, no missing
dependency errors, no "please run npm install first."

### 4.1 Baseline `Dockerfile` (Next.js example — adapt per framework, same principles apply)

```dockerfile
# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Dev ----
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4.2 Baseline `docker-compose.yml` (Tier 1 — extend per tier as shown in `## 3.2`)

```yaml
services:
  web:
    build:
      context: .
      target: dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    env_file:
      - .env
    command: npm run dev
```

For Tier 3, add `db` (Postgres) and `mailpit` services, with the app service depending on both
via `depends_on`, and wire `DATABASE_URL` / `SMTP_HOST` to the compose service names rather than
`localhost`.

### 4.3 Rules

- `.env.example` must list every variable the compose file or app expects, with safe dummy
  values — never commit a real `.env`.
- `.dockerignore` must exclude `node_modules`, `.next`, `.git`, and `docs` build artifacts.
- Production target must be a multi-stage build that ends up small (`node:20-alpine`, standalone
  Next.js output, or framework equivalent) — never ship `node_modules` dev dependencies to prod.
- If the user's stack isn't Next.js (e.g. Vite + React, Astro, SvelteKit), adapt the same
  multi-stage dev/build/production pattern to that framework's conventions. The pattern matters
  more than the specific commands.

---

## 5. Code Quality Doctrine

This is enterprise-grade code, not a hackathon demo. Concretely:

- **TypeScript strict mode on**, no `any` without a comment justifying it.
- **One responsibility per file/component.** If a component file exceeds ~200 lines, it's
  probably doing too much — split it.
- **No magic values.** Colors, spacing, breakpoints, and copy strings live in tokens/constants,
  not hardcoded inline throughout the codebase.
- **Error handling is explicit.** API routes return typed, predictable error shapes. UI handles
  loading, empty, and error states for anything that fetches data — never just the happy path.
- **Tests are not optional for Tier 2/3 projects.** At minimum: unit tests for utility/business
  logic, and one smoke test per critical user flow (e.g. "user can submit the contact form,"
  "user can register and log in").
- **Lint and format are enforced**, not advisory: ESLint + Prettier (or framework-equivalent)
  configured from project start, and code is run through them before being considered done.
- **Before marking any feature complete**, Claude Code should self-review the diff once against
  this section — looking specifically for dead code, unhandled error paths, and accessibility
  gaps — before reporting the feature as finished.
- If a **Code Review** skill slot (see Skill Roster) is present, invoke it on every nontrivial
  diff before considering work done. If absent, perform the self-review above manually and say
  so.

---

## 6. Git & GitHub Readiness

The repo must be genuinely publishable to GitHub and clonable by a stranger, at all times —
not just at the end of the project.

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` prefixes.
- **`.gitignore`** covers `node_modules`, `.env`, `.next`/`dist`, OS files, and editor folders
  from the very first commit.
- **`README.md`** always answers, at minimum: what this project is, how to run it with Docker in
  one command, what environment variables are required, and how to run tests.
- **No secrets in history, ever.** If a key is accidentally committed, treat it as compromised —
  rotate it, don't just delete the line in a new commit.
- **Branching**: `main` is always deployable. Features go on `feature/<short-name>` branches.
  Claude Code should not commit directly to `main` once the project has a working baseline.
- If a **Git Workflow** skill slot is present, defer to its specifics for PR templates/branch
  naming; otherwise the rules above are the standard.

---

## 7. `/docs` Folder — Generated As You Build

Claude Code must create and continuously update a `/docs` folder. This is not a dump of
auto-generated API docs — it's a real explanation of the system for a future developer (which
may be a future instance of Claude, or a human teammate).

```
docs/
├── README.md              # index/map of the docs folder itself
├── architecture.md        # how the pieces fit together, why this tier/stack was chosen
├── setup.md               # local dev setup, Docker commands, env vars explained
├── folder-structure.md    # annotated tree of the actual repo, kept in sync
├── design-system.md       # tokens, type scale, component inventory, the "signature element"
├── seo-and-discoverability.md  # what was implemented from section 8, and why
└── decisions/             # one short file per significant decision, e.g.:
    └── 0001-chose-tier-2-structure.md
```

**Rule:** any time a structural, architectural, or design-system decision is made, it gets a
short entry in `docs/decisions/` *in the same session*, not retroactively. Each entry: what was
decided, what alternatives were considered, why this one won — 5–10 sentences, not an essay.

---

## 8. AI & SEO Discoverability Baseline

Every project, regardless of tier, ships with this baseline. Claude Code decides scope (e.g. a
5-page sitemap vs. a 200-page one) based on actual site size, but never skips a file outright.

| File | Purpose | Notes |
|---|---|---|
| `public/robots.txt` | Crawler rules | Explicitly allow major AI crawlers (e.g. GPTBot, ClaudeBot, Google-Extended) unless the client wants to block them — ask if unclear, don't assume. |
| `public/sitemap.xml` | Standard XML sitemap | Auto-generate from actual routes at build time for Tier 2/3; hand-write for Tier 1. |
| `public/llms.txt` | Plain-language summary of the site for LLM consumption — what the site/company is, key pages, key facts | Follow the emerging llms.txt convention: short markdown, links to key pages, no marketing fluff. |
| Structured data / JSON-LD | Embedded per-page via `<script type="application/ld+json">`, generated from a typed helper in `lib/seo.ts` | Use the correct schema.org type per page (Organization, Article, Product, FAQPage, BreadcrumbList, etc.) — never copy one generic schema onto every page. |
| `public/manifest.json` | PWA manifest | Real icons at correct sizes, real theme color pulled from the design tokens — not placeholder values. |
| Canonical URLs | `<link rel="canonical">` on every page | Especially important for any page reachable via multiple query-param variants. |
| `public/.well-known/security.txt` | Responsible disclosure contact | Real contact info if the client has one; otherwise a clearly marked placeholder the client must fill in before launch. |
| RSS feed | `/feed.xml` route | Only required for Tier 2/3 sites with a blog/content section. |
| AI-friendly content structure | Semantic HTML, one clear `<h1>` per page, descriptive headings in logical order, content not locked behind JS-only rendering for anything that should be crawlable | Server-render or statically generate anything meant to be indexed. |

If a **SEO skill** or **Next.js SEO skill** slot is present in `.claude/skills/`, defer to its
specifics for metadata API usage and per-route conventions; otherwise the table above is the
standard to follow directly.

Before declaring any page "done," Claude Code checks it against this table and `docs/seo-and-
discoverability.md` is updated to reflect what was actually implemented for that page.

---

## 9. Project Memory — So Claude Remembers What Was Built

Claude Code should maintain `.claude/memory/progress.md` as a running log, updated at the end of
every working session (not just at project end):

```markdown
# Project Memory

## Stack & Tier
- Tier: 2 (Dynamic Marketing Site)
- Framework: Next.js 15, App Router, TypeScript
- Styling: Tailwind + custom design tokens (see docs/design-system.md)

## Completed
- [2026-06-24] Scaffolded Tier 2 structure, Docker dev environment working
- [2026-06-24] Home page hero + nav built, design tokens established (see docs/decisions/0002)

## In Progress
- Pricing page — layout drafted, copy pending

## Known Decisions (see docs/decisions/ for full detail)
- Chose Postgres over SQLite because client mentioned future multi-environment deploy
- Brand accent color: #... — derived from client's existing logo, not a default palette

## Open Questions for the User
- Final copy for the About page hasn't been provided
```

This file is the first thing Claude Code should read at the start of any session on an existing
project, before touching code — it replaces re-deriving context from scratch.

---

## 10. Skill Roster (named slots, resolved per `## 0`)

| Slot name | Trigger condition | If missing |
|---|---|---|
| `frontend-design` (built-in, verified) | Any visible UI work | N/A — always available |
| UI/UX Pro Max | Comprehensive UX review of a full flow | Fall back to manual UX heuristics + `frontend-design` |
| taste skill | Subjective design quality pass / "does this feel premium" check | Fall back to Design Doctrine in `## 1` and self-critique step in `frontend-design` |
| Emil Kowalski Design skill | Micro-interaction / motion-detail polish pass | Fall back to "Leverage motion deliberately" guidance already in `frontend-design` |
| Web Design Guidelines | General web UX conventions check | Fall back to WCAG + standard web conventions, applied manually |
| Brand Kit skill | New project with no existing brand assets | Establish tokens manually per `frontend-design`'s brainstorm step, document in `docs/design-system.md` |
| Superpowers skill | Complex multi-step task needing structured decomposition | Plan explicitly in reasoning before acting; no skill needed to do this well |
| Code Review Skill | Any nontrivial diff before marking complete | Manual self-review per `## 5` |
| Git Workflow Skill | Branching/commit/PR conventions | Follow `## 6` directly |
| SEO skill | General on-page SEO pass | Follow `## 8` table directly |
| Next.js SEO skill | Next.js-specific metadata API / route conventions | Use Next.js's native Metadata API per current Next.js docs |

**Verified MCPs** (not skills — see `## 11` for setup):

| MCP | Trigger condition |
|---|---|
| Chrome DevTools MCP | Visual QA, debugging rendered output, performance/Lighthouse-style checks |
| 21st.dev Magic MCP | Fast generation of a specific, common UI component via `/ui` |

> Lighthouse itself is not a Claude skill or MCP — it's an auditing tool. Run it via the Chrome
> DevTools MCP's performance-trace tooling, or via `npx lighthouse <url>` in the Docker container
> against the running dev server, and record results in `docs/seo-and-discoverability.md`.

---

## 11. MCP Setup (do this once per machine, not per project)

These are global Claude Code MCP registrations — run once, available in every project afterward.

**Chrome DevTools MCP** (verified, no API key required):
```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

**21st.dev Magic MCP** (verified, requires a free API key from 21st.dev):
```bash
# 1. Get a key at https://21st.dev/magic/console
# 2. Install:
claude mcp add magic --scope user --env API_KEY="your-api-key" -- npx -y @21st-dev/magic@latest
```

Confirm both are active with `claude mcp list` before relying on them in a session. If either
shows a connection/auth error, fix it before the task that depends on it, rather than silently
working around it.

---

## 12. Definition of Done

A page, feature, or project is not "done" until:

- [ ] It runs correctly via `docker compose up` with no manual extra steps
- [ ] It passes the Code Quality Doctrine self-review (`## 5`)
- [ ] It meets the AI/SEO baseline for its scope (`## 8`)
- [ ] `/docs` reflects the current state of the system (`## 7`)
- [ ] `.claude/memory/progress.md` is updated (`## 9`)
- [ ] It's been visually verified (Chrome DevTools MCP if available, otherwise careful manual
      review) at mobile and desktop widths
- [ ] Accessibility basics hold: keyboard focus visible, semantic structure, sufficient contrast
- [ ] The repo would not embarrass anyone if pushed to a public GitHub repo right now

Claude Code should treat this checklist as binding, not aspirational — don't report a feature as
finished if any box above is actually unchecked.