'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { WORKS_COUNT_RANGE, type SiteSettings } from '@/lib/content/settings';
import type { Work } from '@/lib/store/works';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { AdminCard, AdminNotice } from './ui';

/**
 * A főoldali referencia szekció beállítása.
 *
 * Két dolog állítható: **hány** referencia fér a szekcióba, és **melyek**. A
 * kiválasztás sorrendje számít — a megjelenítés abban a sorrendben mutatja
 * őket, ahogy a szerkesztő kijelölte, nem a lista sorrendjében. Ezért van a
 * kijelölt elemek mellett sorszám: enélkül a szerkesztő nem tudná, mit fog
 * látni.
 *
 * **Kiválasztás nélkül a lista eleje áll be.** Ez nem hiányzó beállítás, hanem
 * a szándékolt alapértelmezés: egy friss telepítésen a szekció akkor is
 * működik, ha ehhez a képernyőhöz még senki nem nyúlt.
 *
 * A címsor és a felvezető nem állítható innen: az az oldal szövege, és a
 * `lib/content/site.ts`-ben él, ahogy minden más szöveg (egy adatnak egy helye
 * van).
 */
export function WorksSectionSettings({
  settings,
  works,
}: {
  settings: SiteSettings;
  works: Work[];
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(settings.works.enabled);
  const [count, setCount] = useState(settings.works.count);
  const [ids, setIds] = useState<string[]>(settings.works.ids);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'success' | 'danger'>('success');

  const published = works.filter((work) => work.published);

  function toggle(id: string) {
    setIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function save() {
    if (pending) return;
    setPending(true);
    setNotice(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        // A teljes beállításobjektumot küldjük: a partnersáv kapcsolóját is,
        // változatlanul. Részleges küldésnél az visszaállna alapértelmezettre.
        body: JSON.stringify({ ...settings, works: { enabled, count, ids } }),
      });

      if (!response.ok) {
        setNoticeTone('danger');
        setNotice('A mentés nem sikerült. Próbáld újra.');
        setPending(false);
        return;
      }

      setNoticeTone('success');
      setNotice('Mentve. A főoldal azonnal frissül.');
      setPending(false);
      router.refresh();
    } catch {
      setNoticeTone('danger');
      setNotice('Hálózati hiba. Próbáld újra.');
      setPending(false);
    }
  }

  return (
    <AdminCard
      title="Főoldali szekció"
      description="Ez jelenik meg a főoldalon, a „Ilyen felületeket építünk” szekció alatt."
    >
      <div className="flex flex-col gap-6">
        {notice ? <AdminNotice tone={noticeTone}>{notice}</AdminNotice> : null}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="block text-body-sm font-medium">Látszódjon a főoldalon</span>
            <span className="mt-1 block text-body-sm text-muted">
              Kikapcsolva a szekció teljesen eltűnik, a hullámhatárok pedig maguktól összezárulnak.
            </span>
          </span>
        </label>

        <div>
          <label htmlFor="works-count" className="block text-body-sm font-medium">
            Hány referencia jelenjen meg
          </label>
          <p className="mt-1 text-body-sm text-muted">
            {WORKS_COUNT_RANGE.min}–{WORKS_COUNT_RANGE.max} között. Kettőnél a rács két hasábos,
            fölötte három.
          </p>
          <input
            id="works-count"
            type="number"
            min={WORKS_COUNT_RANGE.min}
            max={WORKS_COUNT_RANGE.max}
            value={count}
            disabled={!enabled}
            onChange={(event) => setCount(Number(event.target.value) || WORKS_COUNT_RANGE.min)}
            className="mt-2 w-24 rounded-card border border-line-strong bg-paper px-4 py-2.5 text-body-sm disabled:opacity-50"
          />
        </div>

        <div>
          <p className="text-body-sm font-medium">Melyik referenciák</p>
          <p className="mt-1 text-body-sm text-muted">
            {ids.length === 0
              ? 'Nincs kézi kiválasztás — a lista első elemei jelennek meg, sorrend szerint.'
              : `${ids.length} kiválasztva. A sorszám a megjelenés sorrendje.`}
          </p>

          {published.length === 0 ? (
            <p className="mt-3 text-body-sm text-muted">
              Még nincs publikált referencia. Amíg nincs, a szekció nem jelenik meg.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {published.map((work) => {
                const position = ids.indexOf(work.id);
                const picked = position !== -1;
                const beyond = picked && position >= count;

                return (
                  <li key={work.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-card border px-3.5 py-2.5',
                        'transition-colors duration-feedback ease-standard',
                        picked ? 'border-wave-6 bg-sky' : 'border-line hover:border-line-strong',
                        !enabled && 'pointer-events-none opacity-50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={picked}
                        disabled={!enabled}
                        onChange={() => toggle(work.id)}
                        className="h-4 w-4"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-medium">
                          {work.client}
                        </span>
                        <span className="block truncate text-body-sm text-muted">{work.title}</span>
                      </span>
                      {picked ? (
                        <span
                          className={cn(
                            'shrink-0 rounded-pill px-2 py-0.5 text-body-sm',
                            // Ami a darabszámon túl esik, az nem jelenik meg —
                            // ezt ki kell írni, különben a szerkesztő azt hiszi,
                            // hogy mind a hat kint van.
                            beyond ? 'bg-danger/10 text-danger' : 'bg-deep/10 text-ink',
                          )}
                        >
                          {beyond ? 'nem fér ki' : position + 1}
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? 'Mentés…' : 'Beállítás mentése'}
          </Button>
          {ids.length > 0 ? (
            <button
              type="button"
              onClick={() => setIds([])}
              disabled={pending || !enabled}
              className="text-body-sm text-muted transition-colors duration-feedback hover:text-ink disabled:opacity-50"
            >
              Kiválasztás törlése
            </button>
          ) : null}
        </div>
      </div>
    </AdminCard>
  );
}
