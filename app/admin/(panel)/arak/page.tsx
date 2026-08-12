import { PriceForm } from '@/components/admin/price-form';
import { getSettings } from '@/lib/store/settings';

export const dynamic = 'force-dynamic';

export default async function AdminPricesPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Árak</h1>
        <p className="mt-1 text-muted">
          Az itt megadott értékek jelennek meg az oldalon. Szabad szöveg, tehát írhatsz „-tól”
          végződést vagy „Egyedi ajánlat” feliratot is.
        </p>
      </header>

      <PriceForm prices={settings.prices} />
    </div>
  );
}
