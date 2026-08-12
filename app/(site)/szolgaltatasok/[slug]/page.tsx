import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/site/page-header';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { ButtonLink, ArrowLink } from '@/components/ui/button';
import { GlowSpot } from '@/components/ui/section-art';
import { Showcase } from '@/components/sections/showcase';
import { Pricing } from '@/components/sections/pricing';
import { Faq } from '@/components/sections/faq';
import { CtaBand } from '@/components/sections/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getSettings, priceOf } from '@/lib/store/settings';
import { getService, services, showcaseFor, primaryCta } from '@/lib/site';

export const revalidate = 300;

/** A három szolgáltatás fix; build időben mindhárom oldal elkészül. */
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.title,
    description: service.summary,
    path: `/szolgaltatasok/${service.slug}`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const settings = await getSettings();
  const price = priceOf(settings, service.priceKey);
  const others = services.filter((item) => item.slug !== service.slug);
  const examples = showcaseFor(service.slug);

  return (
    <>
      <PageHeader
        eyebrow="Szolgáltatás"
        title={service.title}
        lead={service.intro}
        art={service.image}
      >
        <ButtonLink href={primaryCta.href} size="lg">
          {primaryCta.label}
        </ButtonLink>
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-5 py-2.5 text-[0.9375rem] text-muted">
          <span className="font-semibold text-foreground">{price}</span>
          {service.priceNote ? (
            <span className="hidden sm:inline">· {service.priceNote}</span>
          ) : null}
        </span>
      </PageHeader>

      {/* Kinek ajánljuk + mindig benne van */}
      <Section spacing="tight">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div data-reveal>
              <h2 className="text-2xl">Kinek ajánljuk</h2>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {service.idealFor.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-[0.9375rem] text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
              <h2 className="text-2xl">Ez mindig benne van</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-[0.9375rem] text-muted">
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
            </div>
          </div>
        </Container>
      </Section>

      {/* Példák: nagy, keret nélküli felületek. A fejlécben szereplő kép
          kimarad, hogy ne lássuk kétszer ugyanazt az oldalon. */}
      <Showcase items={examples} exclude={service.image} tone="surface" />

      {/* Részletek */}
      <Section className="isolate overflow-hidden">
        <GlowSpot className="-left-40 top-1/4" size="34rem" />
        <Container className="relative">
          <SectionHeader eyebrow="Részletek" title="Mit jelent ez a gyakorlatban?" />

          <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
            {service.detail.map((block, index) => (
              <div
                key={block.title}
                data-reveal
                style={{ '--reveal-delay': `${(index % 2) * 90}ms` } as React.CSSProperties}
                className="border-t border-border pt-7"
              >
                <h3 className="text-xl">{block.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{block.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Pricing service={service} settings={settings} />

      {/* Továbblépés a másik két szolgáltatásra */}
      <Section spacing="tight">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <h2 data-reveal className="text-2xl">
                A többi szolgáltatásunk
              </h2>
              <div className="mt-6">
                <ArrowLink href="/folyamat">Nézd meg, hogyan dolgozunk</ArrowLink>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {others.map((other, index) => (
                <li
                  key={other.slug}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
                >
                  <Link
                    href={`/szolgaltatasok/${other.slug}`}
                    className="group flex h-full items-start justify-between gap-6 rounded-2xl border border-border bg-surface-raised p-6 transition-[transform,border-color,box-shadow] duration-normal ease-expo hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{other.title}</span>
                      <span className="mt-1.5 block text-[0.9375rem] text-muted">
                        {other.summary}
                      </span>
                    </span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-subtle transition-transform duration-normal ease-expo group-hover:translate-x-1 group-hover:text-primary"
                    >
                      <path
                        d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Faq />

      <CtaBand />

      <JsonLd
        data={[
          serviceJsonLd(service, price, settings.contact.areaServed),
          breadcrumbJsonLd([
            { name: 'Főoldal', path: '/' },
            { name: 'Szolgáltatások', path: '/szolgaltatasok' },
            { name: service.title, path: `/szolgaltatasok/${service.slug}` },
          ]),
        ]}
      />
    </>
  );
}
