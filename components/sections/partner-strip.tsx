import { listPartners, type Partner } from '@/lib/store/partners';
import { getSiteSettings } from '@/lib/store/site-settings';
import { Container } from '@/components/ui/container';
import { LogoMark } from '@/components/ui/logo-mark';

/**
 * Partnersáv a nyitóképernyő alatt.
 *
 * **Miért nincs fölötte hullámsáv.** Ez nem új felület, hanem a nyitóképernyő
 * folytatása: ugyanaz a mély kék, közvetlenül alatta. Egy hullámhatár azt
 * ígérné, hogy új szekció kezdődik — holott a sáv a nyitókép záró gesztusa. A
 * lap hullámlánca így érintetlen marad: az alatta lévő szekció továbbra is
 * kékről érkezik, akár látszik a sáv, akár ki van kapcsolva.
 *
 * **Miért világos korongon ülnek az emblémák.** A logókat az admin tölti fel,
 * tehát bármilyen színűek lehetnek — egy sötét logó a mély kéken eltűnne. A
 * monokróm, fehérre festett megoldás ezt megoldaná, de elvenné a márkák saját
 * színét, amihez általában ragaszkodnak. A világos korong mindkettőt megtartja.
 *
 * **A csúszás.** Folyamatos, egyenletes mozgás — `linear`, mert nincs kezdete és
 * vége, és minden gyorsulás azt sugallná, hogy történik valami. Tisztán
 * `transform`, tehát a compositoron fut; CSS animáció, nem JavaScript, tehát
 * betöltés közben sem esik ki képkocka. Rámutatásra megáll: aki el akar olvasni
 * egy nevet, tudja olvasni. Csökkentett mozgásnál nem csúszik, hanem tördelve
 * áll — az információ nem vész el, csak a mozgás.
 */

/**
 * Ennyi elemre töltjük fel a sávot ismétléssel.
 *
 * A végtelenített csúszás úgy működik, hogy két azonos sáv fut egymás után, és
 * mindkettő a **saját szélességével** tolódik el. Ha egy sáv keskenyebb a
 * képernyőnél, a ciklus végén üres hely marad a jobb szélen. Nyolc embléma a
 * legszélesebb nézetet is kitölti.
 */
const MIN_ITEMS = 8;

export async function PartnerStrip() {
  const settings = await getSiteSettings();
  if (!settings.partners.enabled) return null;

  const partners = await listPartners();
  if (partners.length === 0) return null;

  // Ismétléssel töltjük fel a sávot. A kulcs az ismétlés sorszámát is
  // tartalmazza, különben két azonos kulcsú elem kerülne a listába. Az első kör
  // utáni másolatok meg vannak jelölve: állókép esetén (csökkentett mozgás)
  // kiesnek, mert ott az ismétlés már nem folytonosság, hanem kettőzés.
  const repeats = Math.max(1, Math.ceil(MIN_ITEMS / partners.length));
  const track = Array.from({ length: repeats }, (_, round) =>
    partners.map((partner) => ({ partner, key: `${partner.id}-${round}`, repeat: round > 0 })),
  ).flat();

  return (
    <section
      data-tone="dark"
      aria-labelledby="partnerek-cim"
      className="relative isolate overflow-hidden bg-wave-9 py-12 text-on-dark md:py-14"
    >
      <Container>
        <h2 id="partnerek-cim" className="text-body-sm font-medium text-on-dark/80">
          Velük dolgozunk együtt
        </h2>
      </Container>

      <div className="marquee mt-7">
        <MarqueeTrack items={track} />
        {/* A második sáv a végtelenítés: ugyanaz a tartalom, de a
            képernyőolvasónak már nem mondjuk el újra. */}
        <MarqueeTrack items={track} clone />
      </div>
    </section>
  );
}

function MarqueeTrack({
  items,
  clone = false,
}: {
  items: { partner: Partner; key: string; repeat: boolean }[];
  clone?: boolean;
}) {
  return (
    // A klónt az `aria-hidden` teljes egészében elrejti a képernyőolvasó elől,
    // a leszármazottaival együtt — így nem kell elemenként némítani.
    <ul
      className={clone ? 'marquee__track marquee__track--clone' : 'marquee__track'}
      {...(clone ? { 'aria-hidden': true } : {})}
    >
      {items.map(({ partner, key, repeat }) => (
        <li key={key} className={repeat ? 'marquee__item marquee__item--repeat' : 'marquee__item'}>
          {partner.url ? (
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-card transition-opacity duration-feedback ease-standard hover:opacity-85"
              // A klón másolat: a billentyűzetes bejárásból ki kell esnie,
              // különben minden partner kétszer jönne szembe tabulálva.
              {...(clone ? { tabIndex: -1 } : {})}
            >
              <LogoMark src={partner.logo} alt={partner.name} className="h-16 w-40 px-5 py-3" />
            </a>
          ) : (
            <LogoMark src={partner.logo} alt={partner.name} className="h-16 w-40 px-5 py-3" />
          )}
        </li>
      ))}
    </ul>
  );
}
