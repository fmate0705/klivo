import { absoluteUrl } from '@/lib/site-url';
import { faqs, site, type Service } from '@/lib/site';
import type { Organization } from '@/lib/store/organization';
import type { Post } from '@/lib/store/posts';

/**
 * Strukturált adat (JSON-LD).
 *
 * Ez az a réteg, amit sem a Google, sem az AI-alapú keresők nem „olvasnak ki”
 * találgatásból: itt mondjuk meg gépi formában, mi ez a cég, milyen
 * szolgáltatásokat ad, és mi micsoda az oldalon. Egyetlen modulban él, mert a
 * `@id` hivatkozásoknak egyezniük kell — szétszórva ez az első, ami elromlik.
 *
 * Minden entitásnak stabil `@id`-je van (`#organization`, `#website`), és a
 * többi objektum ezekre hivatkozik ahelyett, hogy újra leírná a céget.
 */

const ORGANIZATION_ID = absoluteUrl('/#organization');
const WEBSITE_ID = absoluteUrl('/#website');

export function organizationJsonLd({ contact, company }: Organization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ORGANIZATION_ID,
    name: site.name,
    url: absoluteUrl('/'),
    description: site.description,
    email: contact.email,
    telephone: contact.phone,
    areaServed: { '@type': 'Country', name: contact.areaServed },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'HU',
      streetAddress: company.seat,
    },
    knowsLanguage: ['hu'],
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: site.name,
    inLanguage: 'hu-HU',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function serviceJsonLd(service: Service, price: string, areaServed: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    url: absoluteUrl(`/szolgaltatasok/${service.slug}`),
    serviceType: service.title,
    provider: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'Country', name: areaServed },
    // Az ár szabad szöveg ("100 000 Ft-tól"), ezért `offers.description`-ben
    // adjuk meg, nem `price`-ban: egy nem szám érték a `price` mezőben érvénytelen
    // strukturált adat, és a Search Console hibát jelez rá.
    offers: {
      '@type': 'Offer',
      priceCurrency: 'HUF',
      description: price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(`/szolgaltatasok/${service.slug}`),
    },
  };
}

export function faqJsonLd(items: readonly { q: string; a: string }[] = faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function articleJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: 'hu-HU',
    author: { '@type': 'Organization', name: post.author, '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(post.image ? { image: [absoluteUrl(post.image)] } : {}),
    articleSection: post.category,
    wordCount: post.body.trim().split(/\s+/).length,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
