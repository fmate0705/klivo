import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';
import { legalPages, services } from '@/lib/site';
import { listPublishedPosts } from '@/lib/store/posts';

export const revalidate = 3600;

/**
 * A sitemap.
 *
 * A `priority` és a `changeFrequency` erős ajánlás, nem parancs — a keresők
 * jórészt figyelmen kívül hagyják. Ami tényleg számít, az a teljesség (minden
 * indexelendő oldal szerepel, semmi más) és a pontos `lastModified`: ez alapján
 * dönt a bejáró arról, mit érdemes újra megnéznie.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: absoluteUrl('/szolgaltatasok'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { url: absoluteUrl('/folyamat'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/rolunk'), lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: absoluteUrl('/kapcsolat'), lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: absoluteUrl(`/szolgaltatasok/${service.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  const legal: MetadataRoute.Sitemap = legalPages.map((page) => ({
    url: absoluteUrl(`/jogi/${page.slug}`),
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...staticPages, ...servicePages, ...postPages, ...legal];
}
