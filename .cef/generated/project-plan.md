# klivo — Implementation Plan

> Generated 2026-08-08T10:03:21.581Z. Plan only — no code is generated in this phase.

## Business

- Industry: Creative Agency
- Business model: project-based
- Complexity: medium
- Positioning: klivo is positioned as a professional creative agency presence.

## Objectives

- Drive project inquiry
- Drive contact form

## Pages (11)

- **Dashboard** (critical) — The authenticated application home.
- **Home** (critical) — Communicate the core value and route visitors to conversion.
- **Sign Up** (critical) — Register new users.
- **About** (high) — Build trust through story, team, and credibility.
- **Admin** (high) — Back-office management.
- **Contact** (high) — Capture inquiries and provide details.
- **Login** (high) — Authenticate returning users.
- **Services** (high) — Explain offerings and their outcomes.
- **Work** (high) — Showcase selected projects.
- **Blog** (medium) — Publish content for SEO and authority.
- **Legal** (medium) — Required legal and policy pages.

## Features (7)

- **Analytics** (high, low) — Always measure outcomes
- **Contact Forms** (high, low) — Standard for creative agency
- **Newsletter** (high, low) — Standard for creative agency
- **Admin** (medium, high) — Requested in the project brief
- **AI Features** (medium, high) — Requested in the project brief
- **Authentication** (medium, high) — Required by Admin
- **CMS** (low, medium) — Requested in the project brief

## Integrations

- AI — Anthropic Claude (Needed for ai-features)
- Analytics — Plausible (Needed for analytics)
- Authentication — Auth provider (Needed for authentication)
- Headless CMS — Sanity (Needed for cms)
- Email / Newsletter — Resend (Needed for newsletter)

## Recommendations

- **[critical] Build the critical path first** — Ship Dashboard, Home, Sign Up before secondary pages.
- **[high] Build accessible components from the first line** — Meeting WCAG 2.2 AA up front is far cheaper than retrofitting it.
- **[high] Lead with the strongest value proposition** — Foreground "award-winning work" on the home hero.
- **[medium] Instrument analytics from day one** — Track project inquiry to learn what works.
- **[medium] Sequence high-complexity features** — Integrate Admin, AI Features, Authentication incrementally.

## Risks

- **warning: 3 high-complexity features increase integration risk.** → Sequence high-complexity features across milestones; integrate incrementally.
- **warning: 6 legal pages require professional review before launch.** → Generated legal text is a draft only. It MUST be reviewed by a qualified legal professional before publication; CEF does not provide legal advice.

## Legal

- Privacy Policy (required) — Standard disclosure of data handling.
- Terms of Service (required) — Governs use of the site and services.
- Cookie Policy (required) — Required where cookies or tracking are used.
- Impresszum (required) — Hungarian law requires site operator identification.
- ÁSZF (Általános Szerződési Feltételek) — Required for Hungarian online sales.
- Adatkezelési Tájékoztató (required) — Hungarian GDPR data-processing notice.
- Cookie Tájékoztató (required) — Hungarian cookie notice.

> Generated legal text is a draft only. It MUST be reviewed by a qualified legal professional before publication; CEF does not provide legal advice.
