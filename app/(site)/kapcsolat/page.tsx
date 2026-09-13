import { pageMeta, processSteps } from '@/lib/content/site';
import { listSocialLinks } from '@/lib/store/social';
import { emailHref, getOrganization, phoneHref } from '@/lib/organization';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { PageHeader } from '@/components/site/page-header';
import { SocialLinks } from '@/components/site/social-links';
import { ContactForm } from '@/components/sections/contact-form';
import { FaqSection } from '@/components/sections/faq-section';
import { WaveRule } from '@/components/wave/wave-rule';
import { FooterWave } from '@/components/site/footer-wave';

export const metadata = buildMetadata({
  title: pageMeta.contact.title,
  description: pageMeta.contact.description,
  path: '/kapcsolat',
});

/**
 * A kapcsolat és ajánlatkérés oldal.
 *
 * **Egy oldal, egy cím.** A korábbi felépítésben két menüpont vitt ide
 * („Kapcsolat” és „Ajánlatkérés”), ami két különböző oldalt ígért, és a
 * látogatónak olyan döntést adott, aminek nem volt következménye. Most a
 * fejlécből egyetlen gomb vezet ide, és az oldal maga mondja meg, hogy
 * ugyanaz a kettő.
 *
 * Az űrlap mellett ott a közvetlen elérhetőség is: aki telefonálni akar, annak
 * nem szabad előbb egy űrlapot kitöltenie.
 */
export default async function ContactPage() {
  const { contact } = getOrganization();
  const social = await listSocialLinks();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Kapcsolat', path: '/kapcsolat' },
        ])}
      />

      {/* Az űrlap a fejlécben. Aki erre az oldalra jön, azért jön: nem
          bevezetőt keres, hanem a mezőket. Egy külön „hero” fölötte csak egy
          képernyőnyi görgetés lenne az űrlap előtt. */}
      <PageHeader
        title="Kapcsolat és ajánlatkérés"
        lead={`Írd le néhány mondatban, mire van szükséged. Átnézzük, és fix árat adunk rá. ${contact.responseTime}`}
      />

      <Section tone="white" band={{ from: 'blue', layers: 3, depth: 'lg' }}>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="text-h3">Kérj ajánlatot</h2>
                <WaveRule tone="soft" className="mt-5 max-w-xs" />
              </Reveal>

              <Reveal delay={60} className="mt-8">
                <ContactForm />
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <Reveal delay={120}>
                  <Card>
                    <h2 className="text-h5">Közvetlen elérhetőség</h2>
                    <WaveRule tone="soft" className="mt-4" />

                    <ul className="mt-6 flex flex-col gap-5 text-body">
                      <li>
                        <span className="text-soft block text-body-sm">E-mail</span>
                        <a
                          href={emailHref(contact.email)}
                          className="link-underline mt-0.5 inline-block text-ink"
                        >
                          {contact.email}
                        </a>
                      </li>
                      <li>
                        <span className="text-soft block text-body-sm">Telefon</span>
                        <a
                          href={phoneHref(contact.phone)}
                          className="link-underline mt-0.5 inline-block text-ink"
                        >
                          {contact.phone}
                        </a>
                      </li>
                      <li>
                        <span className="text-soft block text-body-sm">Ügyfélfogadás</span>
                        <span className="mt-0.5 block">{contact.hours}</span>
                      </li>
                      <li>
                        <span className="text-soft block text-body-sm">Kiszolgált terület</span>
                        <span className="mt-0.5 block">{contact.areaServed}</span>
                      </li>
                    </ul>

                    {social.length > 0 ? (
                      <>
                        {/* A közösségi profilok az elérhetőség folytatása, nem
                            külön szekció: aki ezt a kártyát olvassa, épp azt
                            keresi, hogyan érhet el minket. */}
                        <WaveRule tone="soft" className="mt-6" />
                        <p className="text-soft mt-6 text-body-sm">Itt is megtalálsz</p>
                        <SocialLinks links={social} className="mt-3" />
                      </>
                    ) : null}
                  </Card>
                </Reveal>

                <Reveal delay={160} className="mt-8">
                  <h2 className="text-h5">Mi történik az üzeneted után?</h2>
                  <ol className="text-soft mt-5 flex flex-col gap-4 text-body-sm">
                    {processSteps.slice(0, 3).map((step, index) => (
                      <li key={step.title} className="flex gap-3">
                        <span
                          data-numeric
                          className="text-ink border-soft bg-raised flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border text-body-sm font-semibold"
                        >
                          {index + 1}
                        </span>
                        <span>
                          <strong className="font-semibold text-ink">{step.title}.</strong>{' '}
                          {step.body}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <FaqSection
        page="kapcsolat"
        tone="sky"
        band={{ from: 'white', layers: 3, depth: 'md', flip: true }}
      />

      <FooterWave from="sky" />
    </>
  );
}
