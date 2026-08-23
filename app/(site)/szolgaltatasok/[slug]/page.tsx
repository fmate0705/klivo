import { notFound } from 'next/navigation';
import { getService, services, showcaseFor } from '@/lib/content/site';
import { priceOf } from '@/lib/content/pricing';
import { getOrganization } from '@/lib/organization';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardLink } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { PageHeader } from '@/components/site/page-header';
import { Showcase } from '@/components/sections/showcase';
import { Pricing } from '@/components/sections/pricing';
import { HourlyRates } from '@/components/sections/hourly-rates';
import { CtaBand } from '@/components/sections/cta-band';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Egy szolgáltatás aloldala.
 *
 * A három szolgáltatás mind ugyanezt a felépítést kapja — mi ez, kinek jó, mi
 * van benne, hogy néz ki, mennyibe kerül, mi van még. Aki két szolgáltatást
 * hasonlít össze, ugyanazon a helyen találja ugyanazt az információt.
 *
 * `generateStaticParams` miatt a három oldal buildkor generálódik: nincs
 * futásidejű útvonal-feloldás, és a szolgáltatás lista a kódból jön, tehát nem
 * is változhat deploy nélkül.
 */
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.meta.title,
    description: service.meta.description,
    path: `/szolgaltatasok/${service.slug}`,
    image: service.image.src,
  });
}

/** Felsoroláspont. A jelentést a szöveg hordozza, ez csak a ritmus. */
function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-[0.55em] block h-1.5 w-1.5 shrink-0 rounded-pill bg-wave-5"
    />
  );
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const { contact } = getOrganization();
  // A fejlécben már látható kép nem szerepel újra a példák között.
  const examples = showcaseFor(service.slug).filter((item) => item.image.src !== service.image.src);
  const others = services.filter((item) => item.slug !== service.slug);

  // A felületek végig váltakoznak — a példák szekció megléte egy lépéssel
  // eltolja a sorrendet, ezért nem lehet beégetni a tónusokat.
  const hasExamples = examples.length > 0;

  /**
   * Az egyedi fejlesztésnél a „kinek való / mi van benne” két listája nem
   * mond semmit: ott minden a felméréstől függ, és a csomagkártyák pontosabban
   * válaszolnak ugyanerre.
   */
  const showLists = service.slug !== 'egyedi-fejlesztes';

  /** Óradíjas módosítás csak ott, ahol van meglévő oldal, amin dolgozni kell. */
  const showHourly = service.slug === 'weboldal-keszites' || service.slug === 'tarhely';

  /**
   * A csomagok alatti lábjegyzet csak az üzemeltetésnél marad: ott valódi
   * döntési információ (migrációs díj, felár). A másik két oldalon a
   * csomagkártyák önmagukban is teljesek, és a lábjegyzet csak elvonja róluk a
   * figyelmet.
   */
  const showPriceNotes = service.slug === 'tarhely';

  // A nyitóképernyő után mindig fehér szekció jön; onnan váltakoznak a
  // felületek. A meglévő szekciók száma oldalanként más, ezért a sorrendet ki
  // kell számolni, nem beégetni.
  const detailTone = showLists ? 'sky' : 'white';
  const priceTone = hasExamples ? 'sky' : 'white';
  const othersTone = hasExamples ? 'white' : 'sky';

  return (
    <>
      <JsonLd data={serviceJsonLd(service, priceOf(service.priceKey), contact.areaServed)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Szolgáltatások', path: '/szolgaltatasok' },
          { name: service.title, path: `/szolgaltatasok/${service.slug}` },
        ])}
      />

      {/* A fejlécben csak a cselekvés áll. Az ár a saját szekciójában van, a
          csomagokkal együtt — a gomb mellé odabiggyesztve kiragadott szám volt,
          ami elvitte a figyelmet a cselekvésről, és a csomagok nélkül úgysem
          mondott semmit. */}
      <PageHeader title={service.title} lead={service.intro} image={service.image}>
        <ButtonLink href="/kapcsolat" tone="dark" size="lg" arrow>
          Kérj ajánlatot
        </ButtonLink>
      </PageHeader>

      {/* Kinek ajánljuk + mit tartalmaz.

          **Két kártya helyett egy hasáb.** A két lista korábban két egyforma
          kártyában állt egymás mellett, tele elválasztó vonallal — együtt egy
          teljes képernyőnyi helyet vitt el azért, hogy elmondjon tizenkét rövid
          tagmondatot. A tartalom rövid, tehát a forma is legyen az: a címsor
          balra, a két lista jobbra, kártyakeret nélkül.

          A „kinek ajánljuk” pontjai **címkék**: két-három szavas jelzők, amiket
          az ember végigpásztáz, nem végigolvas — a pasztillasor pontosan ezt a
          leolvasást támogatja, és ez adja a szekció képi hangsúlyát is. A „mi
          van benne” marad felsorolás, mert azt tételesen kell tudni. */}
      {showLists ? (
        <Section tone="white" band={{ from: 'blue', layers: 3, depth: 'lg' }}>
          <Container>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <SectionHeading
                  title="Kinek való, és mi van benne"
                  lead="Semmi apróbetűs. Ha valami hiányzik belőle, azt külön tételként írjuk az ajánlatba — nem utólag derül ki."
                />
              </div>

              <div className="lg:col-span-7">
                <Reveal as="h3" className="text-h4">
                  Kinek ajánljuk
                </Reveal>

                <Reveal as="ul" delay={60} className="mt-6 flex flex-wrap gap-2.5">
                  {service.idealFor.map((item) => (
                    <li
                      key={item}
                      className="border-soft bg-sky flex items-start gap-2.5 rounded-pill border px-4 py-2.5 text-body-sm font-medium text-ink"
                    >
                      <Dot />
                      <span>{item}</span>
                    </li>
                  ))}
                </Reveal>

                {/* Rövid szakasz, nem teljes szélességű vonal: a hullámminta a doboz
                    szélességét tölti ki, és nyolcszáz képponton már nem elválasztó
                    jel, hanem firka. */}
                <WaveRule tone="soft" className="mt-12 max-w-[9rem]" />

                <Reveal as="h3" delay={40} className="mt-8 text-h4">
                  Ez mindig benne van
                </Reveal>

                <Reveal as="ul" delay={100} className="mt-6 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
                  {service.features.map((item) => (
                    <li key={item} className="flex gap-3 text-body-sm text-ink-soft">
                      <Dot />
                      <span>{item}</span>
                    </li>
                  ))}
                </Reveal>

                {service.priceNote ? (
                  <Reveal as="p" delay={140} className="mt-10 max-w-prose text-body-sm text-muted">
                    {service.priceNote}
                  </Reveal>
                ) : null}
              </div>
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Részletek */}
      <Section
        tone={detailTone}
        band={{ from: showLists ? 'white' : 'blue', layers: 3, depth: 'lg', flip: showLists }}
      >
        <Container>
          <SectionHeading
            title="Mit jelent ez a gyakorlatban?"
            lead="Nem technológiákat sorolunk fel, hanem azt, hogy mi történik, és annak mi a haszna."
            className="max-w-3xl"
          />

          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:mt-16">
            {service.detail.map((block, index) => (
              <Reveal as="li" key={block.title} delay={staggerDelay(index, 40)} className="flex">
                <Card className="flex w-full flex-col">
                  <WaveRule />
                  <h3 className="mt-5 text-h5">{block.title}</h3>
                  <p className="mt-3 text-body-sm text-muted">{block.body}</p>
                </Card>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {hasExamples ? (
        <Showcase
          items={examples}
          tone="white"
          band={{ from: detailTone, layers: 3, depth: 'md', flip: true }}
          title="Példák"
          lead="Bemutató felületek — azt mutatják meg, milyen típusú oldalról van szó. Nem ügyfélmunkák."
        />
      ) : null}

      <Pricing
        service={service}
        tone={priceTone}
        notes={showPriceNotes}
        band={{
          from: hasExamples ? 'white' : detailTone,
          layers: 3,
          depth: 'md',
          flip: !hasExamples,
        }}
      />

      {showHourly ? (
        <HourlyRates tone="blue" band={{ from: priceTone, layers: 3, depth: 'lg' }} />
      ) : null}

      {/* A másik két szolgáltatás */}
      <Section
        tone={showHourly ? 'white' : othersTone}
        band={{
          from: showHourly ? 'blue' : priceTone,
          layers: 3,
          depth: showHourly ? 'lg' : 'md',
          flip: hasExamples,
        }}
      >
        <Container>
          <SectionHeading
            as="h2"
            title="A többi szolgáltatásunk"
            lead="A legtöbb munka nem áll meg egy szolgáltatásnál. Ezek illeszkednek ahhoz, amit most nézel."
            className="max-w-3xl"
          />

          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {others.map((item, index) => (
              <Reveal as="li" key={item.slug} delay={staggerDelay(index, 60)} className="flex">
                <Card interactive className="flex w-full flex-col">
                  <h3 className="text-h4">
                    <CardLink href={`/szolgaltatasok/${item.slug}`}>{item.title}</CardLink>
                  </h3>
                  <WaveRule className="mt-4" />
                  <p className="mt-4 text-body text-muted">{item.summary}</p>
                  <p className="mt-auto pt-6">
                    <span data-numeric className="text-h5 text-ink">
                      {priceOf(item.priceKey)}
                    </span>
                  </p>
                </Card>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        band={{ from: showHourly ? 'white' : othersTone, layers: 3, depth: 'lg', flip: true }}
      />
    </>
  );
}
