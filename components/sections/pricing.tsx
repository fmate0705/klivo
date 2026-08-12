import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { ButtonLink } from '@/components/ui/button';
import { GridArt } from '@/components/ui/section-art';
import { primaryCta, type Service } from '@/lib/site';
import { priceOf, type Settings } from '@/lib/store/settings';

/**
 * A szolgáltatás árazása.
 *
 * A korábbi három egyforma kártya nem működött: a szem összehasonlítani akarta
 * őket, de nem volt mit összehasonlítani — nem csomagok ezek, hanem *ársávok*,
 * amelyek a munka terjedelmétől függnek. Egy egymás melletti kártyarács ilyenkor
 * azt sugallja, hogy választani kell, holott a válasz mindig „attól függ, mit
 * kérsz”.
 *
 * Ezért árlista lett belőle:
 *
 * - **Soronként egy ársáv**, balra a neve és hogy mit tartalmaz, jobbra az ár,
 *   nagy méretben, jobbra zárva. A szem így egyetlen függőleges vonal mentén
 *   futtatja végig az árakat — pontosan úgy, ahogy egy árlistát olvasunk.
 * - **A tabuláris számjegyek** (`tabular-nums`) miatt az összegek egymás alatt
 *   pontosan igazodnak, nem táncolnak.
 * - **Alatta két blokk**: mi mozgatja az árat, és mit rögzítünk írásban. Ez a
 *   kettő válaszolja meg azt a két kérdést, ami az ár után jön.
 *
 * Mobilon a sorok kártyákká törnek, az ár a név alá kerül — nem zsugorodik
 * olvashatatlanná.
 */
export function Pricing({ service, settings }: { service: Service; settings: Settings }) {
  const price = priceOf(settings, service.priceKey);
  const tiers = service.pricing.tiers;

  return (
    <Section id="arak" tone="surface" className="isolate overflow-hidden">
      <GridArt size={72} opacity={0.5} />

      <Container className="relative">
        <SectionHeader
          eyebrow="Árazás"
          title="Átlátható árak, meglepetés nélkül"
          lead={service.pricing.intro}
        />

        <div
          data-reveal
          className="mt-14 overflow-hidden rounded-3xl border border-border bg-surface-raised shadow-sm"
        >
          {tiers ? (
            <ul className="divide-y divide-border">
              {tiers.map((tier) => (
                <li
                  key={tier.name}
                  className="flex flex-col gap-5 px-6 py-7 transition-colors duration-normal hover:bg-surface/60 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-10 sm:py-8"
                >
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                    {tier.note ? <p className="mt-1 text-sm text-subtle">{tier.note}</p> : null}

                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {tier.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[0.9375rem] text-muted"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                            className="shrink-0"
                          >
                            <path
                              d="M4 8.4 6.6 11 12 5.4"
                              stroke="rgb(var(--primary-rgb))"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="shrink-0 text-2xl font-semibold tabular-nums text-foreground sm:text-right">
                    {priceOf(settings, tier.priceKey)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-10">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                {service.priceNote ? (
                  <p className="mt-1.5 max-w-md text-[0.9375rem] text-muted">{service.priceNote}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-2xl font-semibold text-foreground sm:text-right">
                {price}
              </p>
            </div>
          )}
        </div>

        {service.pricing.extras ? (
          <div data-reveal className="mt-6 rounded-2xl border border-border bg-surface-raised">
            <h3 className="border-b border-border px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-subtle sm:px-10">
              Csomagon felül
            </h3>
            <ul className="divide-y divide-border">
              {service.pricing.extras.map((extra) => (
                <li
                  key={extra.label}
                  className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10"
                >
                  <span>
                    <span className="block text-[0.9375rem] text-foreground">{extra.label}</span>
                    {extra.note ? (
                      <span className="mt-0.5 block text-sm text-subtle">{extra.note}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-foreground sm:text-right">
                    {priceOf(settings, extra.priceKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div
            data-reveal
            className="rounded-2xl border border-border bg-surface-raised p-7 sm:p-8"
          >
            <h3 className="text-base font-semibold">Mi befolyásolja az árat?</h3>
            <ul className="mt-5 space-y-3">
              {service.pricing.factors.map((factor) => (
                <li key={factor} className="flex gap-3 text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-[0.7em] h-px w-4 shrink-0 bg-border-strong"
                  />
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-reveal
            style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
            className="flex flex-col justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/[0.04] p-7 sm:p-8"
          >
            <div>
              <h3 className="text-base font-semibold">Amit írásban rögzítünk</h3>
              <p className="mt-5 leading-relaxed text-muted">{service.pricing.closing}</p>
            </div>

            <ButtonLink href={primaryCta.href} className="self-start">
              {primaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
