import type { Partner } from '@/lib/store/partners';
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
 * **A sáv a nyitóképernyő zárósorának a helyére kerül.** Ha van partner, a
 * hero nem írja ki a saját zárósorát (`Hero closing={false}`): két záró gesztus
 * egymás alatt kioltaná egymást, és a nyitóképernyő a duplájára nyúlna. Emiatt
 * nincs a sávnak felirata sem — a logók magukért beszélnek, és egy „Velük
 * dolgozunk együtt” címke épp azt a sort hozná vissza, amit levettünk.
 *
 * **Korong nélkül.** Az emblémák fehérben érkeznek, tehát a mély kéken korong
 * nélkül is olvashatók; korongon a sáv kártyák sorává esne szét. A referencia
 * kártyákon ez másképp van, ott a `LogoMark` korongos változata fut.
 *
 * **Csak akkor csúszik, ha van mit csúsztatni.** Kevés emblémánál a mozgás
 * öncélú lenne: a logók kiférnek, nincs mit felfedni. Ott állókép van, középre
 * zárva. A küszöb fölött indul a végtelenített csúszás — ott már valóban több
 * embléma van, mint amennyi egyszerre látszik.
 */

/**
 * Ennyi emblémától kezdve csúszik a sáv.
 *
 * A tartalom mértéke 80 rem, a belső margókkal együtt nagyjából 1216 px. Egy
 * embléma legfeljebb 9 rem széles, a köz 3 rem — tehát hét elem az, ami a
 * legszélesebb nézetben már nem fér ki egy sorba. Ennél kevesebbnél a csúszás
 * csak mozgatná azt, ami amúgy is látszik.
 */
const SLIDE_FROM = 7;

/**
 * A csúszó sávot ennyi elemre töltjük fel ismétléssel.
 *
 * A végtelenítés úgy működik, hogy két azonos sáv fut egymás után, és mindkettő
 * a **saját szélességével** tolódik el. Ha egy sáv keskenyebb a doboznál, a
 * ciklus végén üres hely marad a jobb szélen.
 */
const MIN_ITEMS = 10;

export function PartnerStrip({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <section
      data-tone="dark"
      aria-label="Partnereink"
      className="relative isolate overflow-hidden bg-wave-9 py-9 text-on-dark md:py-10"
    >
      <Container>
        {partners.length < SLIDE_FROM ? (
          <StaticRow partners={partners} />
        ) : (
          <Marquee partners={partners} />
        )}
      </Container>
    </section>
  );
}

/** Kevés embléma: egyszerű, középre zárt sor. Tördel, nem csúszik. */
function StaticRow({ partners }: { partners: Partner[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
      {partners.map((partner) => (
        <li key={partner.id}>
          <PartnerLogo partner={partner} />
        </li>
      ))}
    </ul>
  );
}

/** Sok embléma: végtelenített csúszás, két azonos sávval. */
function Marquee({ partners }: { partners: Partner[] }) {
  // A kulcs az ismétlés sorszámát is tartalmazza, különben két azonos kulcsú
  // elem kerülne a listába. Az első kör utáni másolatok meg vannak jelölve:
  // állóképen (csökkentett mozgás) kiesnek, mert ott az ismétlés már nem
  // folytonosság, hanem kettőzés.
  const repeats = Math.max(1, Math.ceil(MIN_ITEMS / partners.length));
  const items = Array.from({ length: repeats }, (_, round) =>
    partners.map((partner) => ({ partner, key: `${partner.id}-${round}`, repeat: round > 0 })),
  ).flat();

  return (
    <div className="marquee">
      <Track items={items} />
      {/* A második sáv a végtelenítés: ugyanaz a tartalom, de a
          képernyőolvasónak már nem mondjuk el újra. */}
      <Track items={items} clone />
    </div>
  );
}

function Track({
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
          <PartnerLogo partner={partner} {...(clone ? { hidden: true } : {})} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Egy embléma, opcionális hivatkozással.
 *
 * A magasság kötött, a szélesség a logóhoz igazodik — egy álló és egy fekvő
 * embléma így egyforma súlyú marad a sorban. Felső korlát viszont kell:
 * enélkül egy nagyon széles szóvédjegy kiszorítaná a többit.
 */
function PartnerLogo({ partner, hidden = false }: { partner: Partner; hidden?: boolean }) {
  const logo = (
    <LogoMark src={partner.logo} alt={partner.name} plate={false} className="h-10 max-w-[9rem]" />
  );

  if (!partner.url) return logo;

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-opacity duration-feedback ease-standard hover:opacity-75"
      // A klón másolat: a billentyűzetes bejárásból ki kell esnie, különben
      // minden partner kétszer jönne szembe tabulálva.
      {...(hidden ? { tabIndex: -1 } : {})}
    >
      {logo}
    </a>
  );
}
