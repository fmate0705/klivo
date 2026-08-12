import { PageHeader } from '@/components/site/page-header';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { ContactForm } from '@/components/sections/contact-form';
import { Faq } from '@/components/sections/faq';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { faqs } from '@/lib/site';
import { emailHref, getSettings, phoneHref } from '@/lib/store/settings';

export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'Kapcsolat — kérj ajánlatot',
  description:
    'Írd meg pár mondatban, mire van szükséged. Egy munkanapon belül válaszolunk, és fix árat adunk. E-mail, telefon, kapcsolati űrlap.',
  path: '/kapcsolat',
});

/** A kapcsolat oldalon a legrelevánsabb négy kérdés jelenik meg a nyolcból. */
const contactFaqs = faqs.filter((item) =>
  [
    'Mennyibe kerül egy weboldal?',
    'Változhat az ár menet közben?',
    'Mennyi idő alatt készül el?',
    'Kell értenem a technikához?',
  ].includes(item.q),
);

export default async function ContactPage() {
  const { contact } = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Kapcsolat"
        title="Kérj ajánlatot"
        lead="Írd le, mire van szükséged — ha van már elképzelésed vagy meglévő oldalad, azt is. Egy munkanapon belül válaszolunk."
      />

      <Section spacing="tight">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20">
            <div data-reveal>
              <ContactForm />
            </div>

            <aside className="space-y-8">
              <div
                data-reveal
                style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
                className="rounded-2xl border border-border bg-surface p-7"
              >
                <h2 className="text-lg">Közvetlen elérhetőség</h2>
                <ul className="mt-5 space-y-4 text-[0.9375rem]">
                  <li>
                    <span className="block text-sm text-subtle">E-mail</span>
                    <a
                      href={emailHref(contact.email)}
                      className="font-medium text-foreground transition-colors duration-fast hover:text-primary"
                    >
                      {contact.email}
                    </a>
                  </li>
                  <li>
                    <span className="block text-sm text-subtle">Telefon</span>
                    <a
                      href={phoneHref(contact.phone)}
                      className="font-medium text-foreground transition-colors duration-fast hover:text-primary"
                    >
                      {contact.phone}
                    </a>
                  </li>
                  <li>
                    <span className="block text-sm text-subtle">Ügyfélfogadás</span>
                    <span className="text-muted">{contact.hours}</span>
                  </li>
                  <li>
                    <span className="block text-sm text-subtle">Kiket szolgálunk ki</span>
                    <span className="text-muted">{contact.areaServed}</span>
                  </li>
                </ul>
              </div>

              <div
                data-reveal
                style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
                className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-7"
              >
                <h2 className="text-lg">Mi történik ezután?</h2>
                <ol className="mt-5 space-y-4 text-[0.9375rem] text-muted">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">1.</span>
                    {contact.responseTime}
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">2.</span>
                    Ha kell, feltesszük a hiányzó kérdéseket — telefonon vagy e-mailben.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">3.</span>
                    Küldünk egy fix árat és határidőt. Ez az ár nem változik menet közben.
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Faq items={contactFaqs} id="kapcsolat-gyik" />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Főoldal', path: '/' },
          { name: 'Kapcsolat', path: '/kapcsolat' },
        ])}
      />
    </>
  );
}
