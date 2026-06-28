import type { Metadata } from "next";
import { site, contact, services, faqs } from "@/lib/site";

/**
 * Egységes oldal-metaadat builder (title, description, canonical, OG, Twitter).
 * Minden aloldal ezt használja, hogy a SEO konzisztens legyen.
 */
export function pageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = path === "/" ? site.url : `${site.url}${path}`;
  const fullTitle =
    path === "/" ? `${site.name} | ${title}` : `${title} | ${site.name}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      title: fullTitle,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/** Szervezet / ProfessionalService + WebSite JSON-LD. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#organization`,
        name: site.name,
        description: site.description,
        url: site.url,
        logo: `${site.url}/favicon.svg`,
        image: `${site.url}/og-image.svg`,
        slogan: site.tagline,
        priceRange: "100000 HUF - egyedi",
        areaServed: { "@type": "Country", name: "Magyarország" },
        address: { "@type": "PostalAddress", addressCountry: "HU" },
        knowsLanguage: ["hu"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: contact.email,
          telephone: contact.phone,
          availableLanguage: ["Hungarian"],
        },
        sameAs: [
          "https://www.facebook.com/",
          "https://www.linkedin.com/",
          "https://www.instagram.com/",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Klivo szolgáltatások",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            name: s.title,
            description: s.summary,
            url: `${site.url}/${s.slug}`,
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: site.lang,
        publisher: { "@id": `${site.url}/#organization` },
      },
    ],
  };
}

/** GYIK JSON-LD (FAQPage) a megadott kérdésekből. */
export function faqJsonLd(items: readonly { q: string; a: string }[] = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Egy szolgáltatás aloldalának Service JSON-LD-je. */
export function serviceJsonLd(slug: string) {
  const s = services.find((x) => x.slug === slug);
  if (!s) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.summary,
    url: `${site.url}/${s.slug}`,
    serviceType: s.title,
    areaServed: { "@type": "Country", name: "Magyarország" },
    provider: { "@id": `${site.url}/#organization` },
  };
}

/** Breadcrumb JSON-LD aloldalakhoz. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  };
}
