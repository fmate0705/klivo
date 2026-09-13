import { absoluteUrl } from '@/lib/site-url';
import { faqs, site, type Service } from '@/lib/content/site';
import { isPlaceholder, type Organization } from '@/lib/organization';
import type { Post } from '@/lib/store/posts';
import type { Work } from '@/lib/store/works';

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

/**
 * A cég.
 *
 * **A kitöltetlen mezők kimaradnak.** A `.env`-ben hiányzó adat helyén az
 * oldalon `[szögletes zárójeles]` helyőrző áll — az a látogatónak szól, és ott
 * hasznos. A strukturált adatot viszont gépek olvassák: ott a helyőrző nem
 * hiányként jelenne meg, hanem a cég **tényleges adataként**. Amit nem tudunk,
 * azt inkább nem állítjuk.
 *
 * A `logo` a futásidőben rajzolt faviconra mutat (`app/icon.tsx`). A Google a
 * szervezeti tudáspanelhez kifejezetten kéri, és így nincs külön képfájl, amit
 * egy arculatváltás után el lehetne felejteni cserélni.
 */
export function organizationJsonLd(
  { contact, company }: Organization,
  /**
   * A közösségi profilok címei.
   *
   * Ez a `sameAs` — ebből tudja a kereső, hogy az oldal és a profilok
   * ugyanahhoz a céghez tartoznak. Üres tömböt nem írunk ki: egy üres
   * `sameAs` nem állítás, csak zaj.
   */
  sameAs: string[] = [],
) {
  // A cím három külön mezőből jön, tehát a strukturált adatban is három külön
  // mezőbe mehet — egyetlen `streetAddress`-be zsúfolva a kereső nem tudná
  // kiolvasni belőle a várost és az irányítószámot.
  const address =
    isPlaceholder(company.postcode) || isPlaceholder(company.city) || isPlaceholder(company.street)
      ? undefined
      : {
          '@type': 'PostalAddress',
          addressCountry: 'HU',
          postalCode: company.postcode,
          addressLocality: company.city,
          streetAddress: company.street,
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ORGANIZATION_ID,
    name: site.name,
    url: absoluteUrl('/'),
    description: site.description,
    logo: absoluteUrl('/icon'),
    image: absoluteUrl('/opengraph-image'),
    ...(isPlaceholder(contact.email) ? {} : { email: contact.email }),
    ...(isPlaceholder(contact.phone) ? {} : { telephone: contact.phone }),
    ...(isPlaceholder(company.legalName) ? {} : { legalName: company.legalName }),
    ...(isPlaceholder(company.taxNumber) ? {} : { taxID: company.taxNumber }),
    areaServed: { '@type': 'Country', name: contact.areaServed },
    ...(address ? { address } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    knowsLanguage: ['hu'],
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

/**
 * Egy esettanulmány.
 *
 * `Article`, nem `CreativeWork`: a referencia oldal szerkesztett, datált,
 * szerzős tartalom — a kereső így tud vele mit kezdeni, és így kerülhet be a
 * cikkszerű találatok közé. Az ügyfél `about`-ként szerepel: róla szól a
 * szöveg, de nem ő a szerzője.
 *
 * A `headline` szándékosan csak a munka címe, nem az „ügyfél — cím" pár: a
 * Google 110 karakter fölött levágja, és a cégnév amúgy is ott van az
 * `about`-ban.
 */
export function caseStudyJsonLd(work: Work) {
  const url = absoluteUrl(`/referenciak/${work.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: work.title,
    description: work.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: work.publishedAt ?? work.createdAt,
    dateModified: work.updatedAt,
    inLanguage: 'hu-HU',
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(work.cover ? { image: [absoluteUrl(work.cover)] } : {}),
    about: { '@type': 'Organization', name: work.client },
    ...(work.industry ? { articleSection: work.industry } : {}),
    ...(work.services.length > 0 ? { keywords: work.services.join(', ') } : {}),
  };
}

/**
 * Rendezett lista egy gyűjtőoldalhoz (referenciák, blog).
 *
 * A `position` **egytől** indul, és a sorrend az, amit a látogató is lát. Ez
 * mondja meg a keresőnek, hogy a lap egy gyűjtemény, és mik az elemei — enélkül
 * a lista csak linkek halmaza.
 */
export function itemListJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
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
