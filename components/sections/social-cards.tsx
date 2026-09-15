import type { SocialLink } from '@/lib/store/social';
import { platformOf } from '@/lib/content/social';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';

/**
 * Közösségi profilok kártyákon.
 *
 * **Miért kártya, ha a láblécben úgyis ott az ikonsor.** Az ikonsor jelzés: aki
 * keresi, megtalálja. Ez a szekció ajánlat: megnevezi a felületet, és akkora
 * célfelületet ad, amit érintéssel is el lehet találni. A kettő nem ugyanaz a
 * feladat, ezért van meg mindkettő — de **egy oldalon belül csak az egyik**: a
 * kapcsolat oldalon ezért került ki az elérhetőség kártyájából a kis ikonsor.
 *
 * **Az adat az adminból jön** (`/admin/kozossegi`), ugyanabból a listából, mint
 * a láblécé. Egy felület felvétele tehát itt is, ott is megjelenik — nincs
 * második szerkesztési út.
 *
 * **A kártyán a felület neve áll, és semmi más.** Korábban alatta ott volt a
 * profil címe is (`facebook.com/klivo`), de az nem mond többet, mint a név: aki
 * a Facebookot keresi, a „Facebook” szóra kattint, nem a címre. Cserébe minden
 * kártya kapott egy második szövegsort, amit mobilon a `break-all` bármikor
 * kettétört — a rács sorai ettől egyenetlen magasságúak lettek. Kísérőmondat
 * sincs arról, mi megy az adott felületen: azt csak kitalálni lehetne.
 *
 * **Egysoros kártya, nem hasáb.** A név, a jel és a nyíl egyetlen sorba fér, a
 * kártya így nagyjából olyan magas, mint egy listasor. Egy ilyen rövid
 * tartalomhoz a magas, oszlopos kártya üres helyet gyárt: a szem nagy dobozt
 * lát, és keresi benne, mi maradt ki belőle.
 *
 * **A nyíl ferde, nem vízszintes.** Az oldal `→` jele azt ígéri: „tovább, itt”.
 * Ez a hivatkozás viszont elvisz az oldalról, új lapra — a ↗ ezt mondja meg,
 * még a kattintás előtt.
 *
 * **A szekció nem dönt a saját láthatóságáról.** Ha nincs profil, a hívó oldal
 * hagyja ki — a `null` visszatérés csak biztonsági háló. A felületek
 * váltakozását (`band.from`) a lap tartja kézben; lásd `CLAUDE.md`.
 */
export function SocialCards({
  links,
  tone = 'sky',
  band,
  title = 'Kövess minket',
  lead = 'Ugyanaz a csapat van a profiljainkon, mint itt. Válaszd azt a felületet, amelyiket amúgy is használod — üzenetet ott is írhatsz.',
}: {
  links: SocialLink[];
  tone?: SectionTone;
  band?: SectionBand;
  title?: string;
  lead?: string;
}) {
  if (links.length === 0) return null;

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading title={title} lead={lead} className="max-w-3xl" />

        {/*
          Automatikus oszlopszám, nem rögzített hármas rács. A profilok száma az
          adminban változik (egytől hétig), és egy fix `lg:grid-cols-3` rácsban
          két profil két keskeny kártyát adna a sor bal szélén, négy pedig
          3 + 1-et. Az `auto-fit` ehelyett kitölti a sort annyi kártyával,
          amennyi elfér.

          A sáv alsó határa 16rem, nem kevesebb: ennyi kell ahhoz, hogy a
          leghosszabb felületnév („X (Twitter)”) a jel és a nyíl mellett is
          egy sorban maradjon. Szűkebb sávban a név tördelne, és a sor
          kártyái különböző magasak lennének.
        */}
        <ul className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          {links.map((link, index) => {
            const platform = platformOf(link.platform);
            // Ismeretlen felület: régebbi adat, amihez már nincs jelünk.
            // Kihagyjuk — egy üres kártya rosszabb, mint a hiánya.
            if (!platform) return null;

            return (
              <Reveal as="li" key={link.id} delay={staggerDelay(index, 60)} className="flex">
                {/*
                  `flush` és nem `p-0`: a `tailwind-merge` a `p-0`-val csak az
                  alap `p-6`-ot ütné le, a `sm:p-7`-et nem, és a kártya 640
                  pixel fölött némán visszakapná a nagy térközt. Lásd `Card`.
                */}
                <Card
                  interactive
                  flush
                  className="flex w-full items-center gap-4 px-5 py-4 sm:px-6 sm:py-5"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-blue text-on-dark shadow-raise transition-transform duration-panel ease-standard group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d={platform.path} />
                    </svg>
                  </span>

                  <h3 className="min-w-0 flex-1 text-h6">
                    {/*
                      Idegen felületre visz, ezért nem `CardLink` (az a belső
                      útvonalak `next/link`-je), hanem sima hivatkozás — új
                      lapon, `noopener`-rel. A `::after` réteg viszont ugyanúgy
                      kiterül a kártyára, tehát az egész kártya kattintható, a
                      képernyőolvasó pedig a felület nevét olvassa fel, nem azt,
                      hogy „tovább”.
                    */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="after:absolute after:inset-0 after:rounded-card"
                    >
                      {platform.label}
                    </a>
                  </h3>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="text-soft h-4 w-4 shrink-0 transition-transform duration-feedback ease-standard group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4" />
                  </svg>
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
