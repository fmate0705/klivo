# klivo — Review Report

> Reviewed 2026-08-08T10:53:21.654Z. Generation does not imply approval.

**Overall 72/100 · Readiness 62/100 · Recommendation: NOT-READY**

## Quality gates

| Gate              | Required | Status | Score |
| ----------------- | -------- | ------ | ----- |
| Architecture      | yes      | ✔ pass | 100   |
| Design            | yes      | ✔ pass | 100   |
| Accessibility     | yes      | ✖ fail | 60    |
| Performance       | yes      | ✔ pass | 100   |
| SEO               | yes      | ⚠ warn | 0     |
| Security          | yes      | ✔ pass | 100   |
| Content           | yes      | ⚠ warn | 0     |
| Brand Consistency | yes      | ✔ pass | 99    |
| Legal             | yes      | ⚠ warn | 0     |
| Docker            | advisory | ✔ pass | 100   |
| Testing           | advisory | ✔ pass | 100   |
| Documentation     | advisory | ✔ pass | 100   |

## Findings

- **[blocker] accessibility** — No skip link to the main content. (app/layout.tsx)
- **[major] seo** — Missing SEO artifact "public/manifest.webmanifest". (public/manifest.webmanifest)
- **[major] seo** — Missing SEO artifact "public/llms.txt". (public/llms.txt)
- **[minor] seo** — Missing SEO artifact "public/humans.txt". (public/humans.txt)
- **[minor] seo** — Missing SEO artifact "public/security.txt". (public/security.txt)
- **[minor] seo** — Missing SEO artifact "public/schema.json". (public/schema.json)
- **[minor] seo** — Page declares no canonical URL. (app/(site)/blog/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/(site)/folyamat/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/(site)/kapcsolat/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/(site)/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/(site)/rolunk/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/(site)/szolgaltatasok/page.tsx)
- **[major] seo** — Page has no metadata export. (app/admin/(panel)/arak/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/admin/(panel)/arak/page.tsx)
- **[major] seo** — Page has no metadata export. (app/admin/(panel)/bejegyzesek/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/admin/(panel)/bejegyzesek/page.tsx)
- **[major] seo** — Page has no metadata export. (app/admin/(panel)/bejegyzesek/uj/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/admin/(panel)/bejegyzesek/uj/page.tsx)
- **[major] seo** — Page has no metadata export. (app/admin/(panel)/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/admin/(panel)/page.tsx)
- **[major] seo** — Page has no metadata export. (app/admin/(panel)/uzenetek/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/admin/(panel)/uzenetek/page.tsx)
- **[major] seo** — Page has no metadata export. (app/admin/belepes/page.tsx)
- **[minor] seo** — Page declares no canonical URL. (app/admin/belepes/page.tsx)
- **[minor] content** — Internal link "/" has no matching page. (app/(site)/blog/[slug]/page.tsx)
- **[minor] content** — Internal link "/blog" has no matching page. (app/(site)/blog/[slug]/page.tsx)
- **[minor] content** — Internal link "/blog" has no matching page. (app/(site)/blog/[slug]/page.tsx)
- **[minor] content** — Internal link "/folyamat" has no matching page. (app/(site)/szolgaltatasok/[slug]/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek" has no matching page. (app/admin/(panel)/bejegyzesek/[id]/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek/uj" has no matching page. (app/admin/(panel)/bejegyzesek/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek" has no matching page. (app/admin/(panel)/bejegyzesek/uj/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek/uj" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/admin/uzenetek" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/admin/bejegyzesek" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/admin/uzenetek" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/admin/arak" has no matching page. (app/admin/(panel)/page.tsx)
- **[minor] content** — Internal link "/" has no matching page. (app/admin/belepes/page.tsx)
- **[minor] content** — Internal link "/" has no matching page. (app/error.tsx)
- **[minor] content** — Internal link "/" has no matching page. (app/not-found.tsx)
- **[minor] content** — Internal link "/kapcsolat" has no matching page. (app/not-found.tsx)
- **[minor] content** — Internal link "/" has no matching page. (components/admin/admin-shell.tsx)
- **[minor] content** — Internal link "/blog" has no matching page. (components/sections/blog-teaser.tsx)
- **[minor] content** — Internal link "/" has no matching page. (components/site/logo.tsx)
- **[nit] content** — Grammar and tone require a human read-through before approval.
- **[nit] brand** — Brand alignment (voice, imagery, tone) needs a human sign-off.
- **[major] legal** — Required legal page "Privacy Policy" is not present.
- **[major] legal** — Required legal page "Terms of Service" is not present.
- **[major] legal** — Required legal page "Cookie Policy" is not present.
- **[major] legal** — Required legal page "Impresszum" is not present.
- **[major] legal** — Required legal page "Adatkezelési Tájékoztató" is not present.
- **[major] legal** — Required legal page "Cookie Tájékoztató" is not present.
- **[major] legal** — Generated legal text requires review by a qualified legal professional.

Approval state: **draft**.
