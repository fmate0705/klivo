import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { ArrowLink } from '@/components/ui/button';
import { SectionArt } from '@/components/ui/section-art';
import { services } from '@/lib/site';
import { priceOf, type Settings } from '@/lib/store/settings';

/**
 * A három szolgáltatás.
 *
 * Az árak nem a kódból jönnek, hanem a beállításokból — ezért kap a komponens
 * `settings` propot ahelyett, hogy maga olvasná be. Így a kártya ugyanaz marad a
 * főoldalon és a szolgáltatás listán, és mindkét helyen egyszerre változik, ha
 * az adminban átírod az árat.
 *
 * A teljes kártya link. Egy kártya, amely megemelkedik a kurzor alatt, de csak
 * a benne lévő apró link kattintható, apró hazugság a felületről.
 */
export function ServicesGrid({
  settings,
  heading = true,
  tone = 'surface',
}: {
  settings: Settings;
  heading?: boolean;
  /** A szolgáltatás listán fehér, hogy a fejléc átmenete ne törjön meg. */
  tone?: 'default' | 'surface';
}) {
  return (
    <Section id="szolgaltatasok" tone={tone} className="isolate overflow-hidden">
      {/* A vonalgrafika háttér, és pont ott, ahol biztonságos: a kártyák saját
          fehér felületen ülnek, tehát a szöveg kontrasztját nem érinti. */}
      {/*
       * A vonalgrafika lejjebb csúszik, és `multiply` módban keveredik.
       *
       * A `multiply` teszi láthatatlanná az SVG fehér alaplapját: fehérrel
       * szorozva a háttér változatlan marad, csak a rajzolt formák sötétítenek.
       * Enélkül a grafika fehér téglalapként ült a szürke szekción, éles
       * peremmel — pontosan az ellenkezője annak, amit egy háttérelemtől várunk.
       */}
      <SectionArt
        src="/images/wave-a.svg"
        position="bottom"
        fit="cover"
        opacity={0.5}
        className="mix-blend-multiply translate-y-[14%]"
      />

      <Container className="relative">
        {heading ? (
          <SectionHeader
            eyebrow="Szolgáltatások"
            title="Megépítjük, elindítjuk, üzemeltetjük"
            lead="A weboldaltól az egyedi webalkalmazásig és az AI-funkciókig. Utána pedig ott maradunk mellette: tárhely, mentés, módosítás."
          />
        ) : null}

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 110}ms` } as React.CSSProperties}
              className="group relative flex flex-col rounded-2xl border border-border bg-surface-raised p-8 transition-[transform,box-shadow,border-color] duration-normal ease-expo hover:-translate-y-1 hover:border-border-strong hover:shadow-lg"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl">
                  <Link
                    href={`/szolgaltatasok/${service.slug}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {service.title}
                  </Link>
                </h3>
              </div>

              <p className="mt-4 leading-relaxed text-muted">{service.summary}</p>

              <ul className="mt-7 space-y-2.5 text-[0.9375rem] text-muted">
                {service.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="mt-1 shrink-0"
                    >
                      <path
                        d="M4 8.4 6.6 11 12 5.4"
                        stroke="rgb(var(--primary-rgb))"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-end justify-between gap-4 border-t border-border pt-6">
                <div>
                  <span className="block text-xs uppercase tracking-[0.14em] text-subtle">Ár</span>
                  <span className="mt-1 block text-lg font-semibold text-foreground">
                    {priceOf(settings, service.priceKey)}
                  </span>
                </div>
                <ArrowLink href={`/szolgaltatasok/${service.slug}`}>Részletek</ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
