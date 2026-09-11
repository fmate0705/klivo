import { PartnerManager } from '@/components/admin/partner-manager';
import { listPartners } from '@/lib/store/partners';
import { getSiteSettings } from '@/lib/store/site-settings';

export const dynamic = 'force-dynamic';

/**
 * A partnersáv kezelése.
 *
 * Külön menüpont a referenciáktól: a partner nem esettanulmány. Egy embléma
 * attól még ott lehet a sávban, hogy nem írtunk hozzá esettanulmányt — és
 * fordítva.
 */
export default async function AdminPartnersPage() {
  const partners = await listPartners();
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h4 font-semibold">Partnerek</h1>
        <p className="mt-1 text-muted">
          A nyitóképernyő alatt csúszó embléma-sáv. {partners.length} embléma.
        </p>
      </header>

      <PartnerManager partners={partners} settings={settings} />
    </div>
  );
}
