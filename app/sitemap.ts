import type { MetadataRoute } from 'next';
import { legalPages, services } from '@/lib/content/site';
import { listPublishedPosts } from '@/lib/store/posts';
import { listPublishedWorks } from '@/lib/store/works';
import { absoluteUrl } from '@/lib/site-url';

/**
 * A sitemap.
 *
 * Csak indexelhető, publikus URL kerül bele. Az admin nem — azt a
 * `robots.ts` is tiltja, és egy sitemapben szereplő, `noindex`-elt oldal
 * ellentmondásos jelzés a keresőnek.
 *
 * A `priority` szándékosan differenciált, de nem hazudik: a főoldal és a
 * szolgáltatások a belépési pontok, a jogi oldalak a lista végén állnak. A
 * `lastModified` a bejegyzéseknél a tényleges szerkesztés ideje, nem a
 * generálás pillanata — az utóbbi minden deploynál „frissnek” hazudná az egész
 * oldalt, és pont ettől veszíti el a jelzés az értékét.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();
  const works = await listPublishedWorks();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    {
      url: absoluteUrl('/szolgaltatasok'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { url: absoluteUrl('/folyamat'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/rolunk'), lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    {
      url: absoluteUrl('/referenciak'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/kapcsolat'), lastModified: now, changeFrequency: 'yearly', priority: 0.9 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: absoluteUrl(`/szolgaltatasok/${service.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  const workPages: MetadataRoute.Sitemap = works.map((work) => ({
    url: absoluteUrl(`/referenciak/${work.slug}`),
    lastModified: new Date(work.updatedAt),
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  const legal: MetadataRoute.Sitemap = legalPages.map((page) => ({
    url: absoluteUrl(`/jogi/${page.slug}`),
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...staticPages, ...servicePages, ...workPages, ...postPages, ...legal];
}
