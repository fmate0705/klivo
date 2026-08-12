import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Logo } from './logo';
import { legalPages, nav, services, site } from '@/lib/site';
import { emailHref, getSettings, phoneHref } from '@/lib/store/settings';

/**
 * A lábléc.
 *
 * Világos felület, felső szegéllyel — az oldal ugyanabban a tónusban ér véget,
 * amelyben elkezdődött. Nem gyűjtőhelye mindennek: csak az van benne, amit egy
 * látogató tényleg keres a végén — mit csinálunk, hol érünk el, és a jogi oldalak.
 */
export async function Footer() {
  const { contact } = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-muted">
              {site.tagline} Weboldalt építünk, üzemeltetjük, és arra hangoljuk, hogy megtaláljanak.
            </p>
          </div>

          <FooterColumn title="Szolgáltatások">
            {services.map((service) => (
              <FooterLink key={service.slug} href={`/szolgaltatasok/${service.slug}`}>
                {service.title}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Klivo">
            {nav
              .filter((item) => item.href !== '/szolgaltatasok')
              .map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
          </FooterColumn>

          <FooterColumn title="Kapcsolat">
            <FooterLink href={emailHref(contact.email)}>{contact.email}</FooterLink>
            <FooterLink href={phoneHref(contact.phone)}>{contact.phone}</FooterLink>
            <li className="pt-1 text-sm text-subtle">{contact.hours}</li>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Minden jog fenntartva.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/jogi/${page.slug}`}
                  className="transition-colors duration-fast hover:text-foreground"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-subtle">
        {title}
      </h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[0.9375rem] text-muted transition-colors duration-fast hover:text-foreground"
      >
        {children}
      </Link>
    </li>
  );
}
