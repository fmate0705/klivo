import { OrganizationForm } from '@/components/admin/organization-form';
import { AdminNotice } from '@/components/admin/ui';
import { getSettings } from '@/lib/store/settings';

export const dynamic = 'force-dynamic';

export default async function AdminOrganizationPage() {
  const settings = await getSettings();

  // A helyőrzőket szögletes zárójel jelöli. Amíg maradt ilyen, ki is írjuk —
  // egy „[adószám]” felirat az élő impresszumban rosszabb, mint egy hiányzó oldal.
  const remainingPlaceholders = [
    ...Object.values(settings.contact),
    ...Object.values(settings.company),
  ].filter((value) => value.includes('[')).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Cégadatok</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Elérhetőség és jogi adatok. Innen frissül a lábléc, a kapcsolat oldal, az impresszum, az
          ÁSZF, az adatkezelési tájékoztató és a keresőknek küldött strukturált adat is.
        </p>
      </header>

      {remainingPlaceholders > 0 ? (
        <AdminNotice tone="danger">
          {remainingPlaceholders} mező még helyőrzőt tartalmaz (szögletes zárójelben). Ezek így
          jelennek meg az oldalon és a jogi dokumentumokban — élesítés előtt cseréld ki őket.
        </AdminNotice>
      ) : null}

      <OrganizationForm contact={settings.contact} company={settings.company} />
    </div>
  );
}
