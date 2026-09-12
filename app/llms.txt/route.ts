import { absoluteUrl } from '@/lib/site-url';
import { faqs, services, site } from '@/lib/content/site';
import { listPublishedPosts } from '@/lib/store/posts';
import { listPublishedWorks } from '@/lib/store/works';
import { priceOf } from '@/lib/content/pricing';
import { getOrganization } from '@/lib/organization';

/**
 * `/llms.txt` — tömör, gépi olvasásra szánt összefoglaló az oldalról.
 *
 * Az AI-alapú keresők és asszisztensek egyre gyakrabban keresik ezt a fájlt,
 * hogy találgatás helyett kapjanak egy rendezett képet a szolgáltatásokról, az
 * árakról és a munkákról. Generált, nem kézzel írt: így nem tud elavulni akkor,
 * amikor az adminban átírsz egy árat, felveszel egy referenciát vagy kiadsz egy
 * új bejegyzést.
 */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const posts = await listPublishedPosts();
  const works = await listPublishedWorks();
  const { contact } = getOrganization();

  const lines: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    '## Szolgáltatások',
    '',
    ...services.flatMap((service) => [
      `- **${service.title}** (${priceOf(service.priceKey)}) — ${service.summary}`,
      `  ${absoluteUrl(`/szolgaltatasok/${service.slug}`)}`,
    ]),
    '',
    '## Hogyan dolgozunk',
    '',
    '- Az árat a munka előtt írásban rögzítjük, és a projekt közben nem változtatjuk meg.',
    '- Nem designterveket küldünk, hanem működő oldalt építünk, majd a visszajelzések alapján alakítjuk.',
    '- A domain a megrendelő nevére szól, az elkészült oldal a megrendelő tulajdona.',
    '- A forráskódot kérésre, illetve a szerződés megszűnésekor átadjuk, külön díj nélkül.',
    '- Az üzemeltetés tartalma: tárhely, napi mentés, frissítések, elérhetőség-figyelés, havi látogatói statisztika.',
    '- Az üzemeltetett oldalakon a módosításokat előre rögzített óradíjban végezzük.',
    '- A rendelkezésre állás tartósan 98% felett van.',
    '',
    '## Fontos oldalak',
    '',
    `- Főoldal: ${absoluteUrl('/')}`,
    `- Szolgáltatások: ${absoluteUrl('/szolgaltatasok')}`,
    `- Referenciák: ${absoluteUrl('/referenciak')}`,
    `- Folyamat: ${absoluteUrl('/folyamat')}`,
    `- Rólunk: ${absoluteUrl('/rolunk')}`,
    `- Blog: ${absoluteUrl('/blog')}`,
    `- Kapcsolat: ${absoluteUrl('/kapcsolat')}`,
    '',
    '## Kapcsolat',
    '',
    `- E-mail: ${contact.email}`,
    `- Telefon: ${contact.phone}`,
    `- Kiszolgált terület: ${contact.areaServed}`,
    `- Ügyfélfogadás: ${contact.hours}`,
    '',
    '## Gyakori kérdések',
    '',
    ...faqs.flatMap((item) => [`### ${item.q}`, '', item.a, '']),
  ];

  // A referenciák a legerősebb bizonyíték, amit egy asszisztensnek adhatunk:
  // nem állítás, hanem megnevezett ügyfél és megnevezett munka. Ezért kerülnek
  // a bejegyzések elé.
  if (works.length > 0) {
    lines.push('## Referenciák', '');
    for (const work of works) {
      const meta = [work.industry, work.year].filter(Boolean).join(', ');
      lines.push(
        `- **${work.client}** — ${work.title}${meta ? ` (${meta})` : ''}`,
        `  ${work.excerpt}`,
        `  ${absoluteUrl(`/referenciak/${work.slug}`)}`,
      );
    }
    lines.push('');
  }

  if (posts.length > 0) {
    lines.push('## Blogbejegyzések', '');
    for (const post of posts) {
      lines.push(`- ${post.title} — ${absoluteUrl(`/blog/${post.slug}`)}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
