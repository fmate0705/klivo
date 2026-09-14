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
 * keresi, megtalálja. Ez a szekció ajánlat: megnevezi a felületet, kiírja a
 * profil címét, és akkora célfelületet ad, amit érintéssel is el lehet találni.
 * A kettő nem ugyanaz a feladat, ezért van meg mindkettő — de **egy oldalon
 * belül csak az egyik**: a kapcsolat oldalon ezért került ki az elérhetőség
 * kártyájából a kis ikonsor.
 *
 * **Az adat az adminból jön** (`/admin/kozossegi`), ugyanabból a listából, mint
 * a láblécé. Egy felület felvétele tehát itt is, ott is megjelenik — nincs
 * második szerkesztési út.
 *
 * **Nincs kitalált kísérőszöveg.** Kézenfekvő lenne minden kártyára írni egy
 * mondatot arról, mi megy az adott felületen, de azt csak kitalálni lehetne. A
 * kártyán ezért a profil címe áll: ez igaz, és ez is mondja meg, hova visz.
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
          adminban változik (egytől nyolcig), és egy fix `lg:grid-cols-3` rácsban
          két profil két keskeny kártyát adna a sor bal szélén, négy pedig
          3 + 1-et. Az `auto-fit` ehelyett kitölti a sort annyi kártyával,
          amennyi elfér.
        */}
        <ul className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-5">
          {links.map((link, index) => {
            const platform = platformOf(link.platform);
            // Ismeretlen felület: régebbi adat, amihez már nincs jelünk.
            // Kihagyjuk — egy üres kártya rosszabb, mint a hiánya.
            if (!platform) return null;

            return (
              <Reveal as="li" key={link.id} delay={staggerDelay(index, 60)} className="flex">
                <Card interactive className="flex w-full flex-col">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-pill bg-blue text-on-dark shadow-raise transition-transform duration-panel ease-standard group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d={platform.path} />
                    </svg>
                  </span>

                  <h3 className="mt-6 text-h5">
                    {/*
                      Idegen felületre visz, ezért nem `CardLink` (az a belső
                      útvonalak `next/link`-je), hanem sima hivatkozás — új
                      lapon, `noopener`-rel. A `::after` réteg viszont ugyanúgy
                      kiterül a kártyára, tehát az egész kártya kattintható, a
                      képernyőolvasó pedig a felület nevét olvassa fel, nem azt,
                      hogy „tovább".
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

                  {/*<p className="text-soft mt-2 break-all text-body-sm">{readable(link.url)}</p>*/}

                  <span
                    aria-hidden="true"
                    className="mt-6 inline-flex items-center gap-2 text-body-sm font-medium text-ink"
                  >
                    Megnyitás
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 transition-transform duration-feedback ease-standard group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </span>
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/**
 * A profil címe olvasható alakban.
 *
 * A `https://` és a `www.` nem hordoz információt, a záró perjel sem — kiírva
 * viszont hosszabbá teszi a sort, és mobilon eltöri. Ami marad
 * (`facebook.com/klivo`), az pont az, amit a látogató felismer.
 *
 * Hibás címre a `URL` kivételt dob: ilyenkor a nyers értéket adjuk vissza,
 * nem üres sort. A validáció ugyan nem enged be ilyet, de egy megjelenítés
 * ne bukjon el azon, ha mégis bejut.
 */
function readable(url: string): string {
  try {
    const parsed = new URL(url);
    return (parsed.host + parsed.pathname).replace(/^www\./, '').replace(/\/$/, '');
  } catch {
    return url;
  }
}
