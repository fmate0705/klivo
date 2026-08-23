import { faqs } from '@/lib/content/site';
import { listFaqForPage, type FaqPageKey } from '@/lib/store/faq';
import type { SectionBand, SectionTone } from '@/components/ui/section';
import { Faq } from '@/components/sections/faq';

/**
 * A gyakori kérdések szekciója, oldalhoz kötve.
 *
 * A kérdéseket az admin szerkeszti (`/admin/gyik`), és minden kérdéshez
 * megadható, mely oldalakon jelenjen meg. Ez a réteg csak az adatot szerzi be —
 * a megjelenítés a `Faq` kliens komponensé, mert a lenyílóhoz állapot kell.
 *
 * **Amíg nincs felvett kérdés, a beépített alapkészlet jelenik meg.** Egy üres
 * GYIK rovat rosszabb, mint egy általános: az első üzenete az, hogy az oldal
 * félkész.
 */
export async function FaqSection({
  page,
  band,
  tone = 'sky',
  title,
  lead,
  limit,
}: {
  /** Melyik oldal kérdései. */
  page: FaqPageKey;
  band?: SectionBand;
  tone?: SectionTone;
  title?: string;
  lead?: string;
  /** Legfeljebb ennyi kérdés. A főoldalon négy elég, a többi a részletes oldalakon. */
  limit?: number;
}) {
  const stored = await listFaqForPage(page);
  const items =
    stored.length > 0
      ? stored.map((item) => ({ q: item.question, a: item.answer }))
      : faqs.map((item) => ({ q: item.q, a: item.a }));

  return (
    <Faq
      items={limit ? items.slice(0, limit) : items}
      band={band}
      tone={tone}
      {...(title ? { title } : {})}
      {...(lead ? { lead } : {})}
    />
  );
}
