import type { MetadataRoute } from 'next';
import { site } from '@/lib/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    // A paletta világos alapja és a legsötétebb tintaárnyalat — ugyanazok az
    // értékek, mint a `globals.css` tokenjei.
    background_color: '#F7F8FA',
    theme_color: '#14161C',
    lang: site.lang,
    icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
  };
}
