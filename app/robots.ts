import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

/**
 * A robots.txt.
 *
 * Az admin és az API kizárása nem biztonsági intézkedés — a robots.txt csak
 * kérés, nem zár. A tényleges védelem a middleware és a JWT munkamenet. Ez arra
 * jó, hogy a keresők ne pazarolják a bejárási keretet olyan útvonalakra,
 * amelyeket úgysem érnek el.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
