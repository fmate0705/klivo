# SEO és AI-discoverability

A CLAUDE.md 8. szakasz baseline-jának megvalósítása (Next.js Metadata API +
JSON-LD).

| Elem | Hol | Megjegyzés |
|---|---|---|
| Per-oldal `title` + `description` | `lib/seo.ts` `pageMetadata()` | Minden aloldal magyar, kulcsszavas |
| Open Graph + Twitter Card | `pageMetadata()` + `layout.tsx` | `og:image` = /og-image.svg |
| Canonical | `pageMetadata()` `alternates.canonical` | Per-oldal |
| JSON-LD: ProfessionalService + WebSite | `layout.tsx` (site-wide) | OfferCatalog a 4 szolgáltatással |
| JSON-LD: FAQPage | főoldal | A látható GYIK-et tükrözi |
| JSON-LD: Service | szolgáltatás-aloldalak | `serviceJsonLd()` |
| JSON-LD: BreadcrumbList | aloldalak | `breadcrumbJsonLd()` |
| `sitemap.xml` | `app/sitemap.ts` | Generált, minden oldallal |
| `robots.txt` | `app/robots.ts` | AI-crawlerek (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) engedélyezve |
| `llms.txt` | `public/llms.txt` | AI-olvasható összefoglaló |
| Web manifest | `app/manifest.ts` | theme_color a tokenből |
| `.well-known/security.txt` | `public/` | RFC 9116, PLACEHOLDER kontakt |
| Szemantikus HTML / 1× H1 / címsorhierarchia | minden oldal | Landmarkok, breadcrumb |
| Szerver-renderelt tartalom | minden oldal | Statikusan prerenderelve (SSG), nincs JS-only tartalom |

## Miért erős ez AI-keresőknek

- A strukturált adat (ProfessionalService + OfferCatalog + FAQPage + Service)
  géppel pontosan értelmezhető szolgáltatás- és árinformációt ad.
- Az `llms.txt` tömör, marketingmentes összefoglalót kínál az LLM-eknek.
- A tartalom szerver-renderelt és JS nélkül is olvasható (a scroll-reveal csak
  vizuális réteg), így az AI-asszisztensek idézhetik és ajánlhatják a céget.

## Lighthouse — rögzítendő

```
Dátum:
Performance / Accessibility / Best Practices / SEO:   /100 each
```

## Teendők éles előtt

- Valós domain a `site.url`-ben (`src/lib/site.ts`) és `NEXT_PUBLIC_SITE_URL`-ben.
- `og-image.svg` → 1200×630 PNG.
- Google Search Console + Bing Webmaster Tools, sitemap beküldés.
