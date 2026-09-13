import Link from 'next/link';
import { footerNav, site } from '@/lib/content/site';
import { emailHref, getOrganization, phoneHref } from '@/lib/organization';
import { listSocialLinks } from '@/lib/store/social';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/site/logo';
import { SocialLinks } from '@/components/site/social-links';

/**
 * A lábléc.
 *
 * Sötét, és a tetején ugyanaz a hullámtaraj zárja le az oldalt, amelyik a
 * szekciók között is fut — így az utolsó képernyő nem elvágva ér véget.
 *
 * Az elérhetőség és a cégadat a `.env`-ből jön (`lib/organization.ts`), a
 * közösségi profilok pedig az adminból — egy telefonszám cseréje vagy egy új
 * csatorna sem lehet forráskód-módosítás.
 */
export async function SiteFooter() {
  const { contact, company } = getOrganization();
  const social = await listSocialLinks();
  const year = new Date().getFullYear();

  return (
    <footer
      data-tone="dark"
      className="relative isolate overflow-hidden bg-blue pb-10 pt-16 text-on-dark lg:pt-20"
    >
      <Container className="wave-content">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex flex-col gap-5">
            <Logo tone="dark" />
            <p className="text-soft max-w-sm text-body-sm">{site.description}</p>

            <ul className="flex flex-col gap-1.5 text-body-sm">
              <li>
                <a
                  href={emailHref(contact.email)}
                  className="link-underline text-on-dark transition-colors duration-feedback ease-standard hover:text-on-dark"
                >
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={phoneHref(contact.phone)}
                  className="link-underline text-on-dark transition-colors duration-feedback ease-standard hover:text-on-dark"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="text-soft">{contact.hours}</li>
            </ul>

            {/* A közösségi profilok a márkablokk alján: az elérhetőség
                folytatása, nem külön hasáb. Ha nincs felvéve egy sem, a sor
                meg sem jelenik. */}
            <SocialLinks links={social} size="sm" className="mt-1" />
          </div>

          <nav aria-label="Lábléc navigáció" className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((column) => (
              <div key={column.title}>
                <h2 className="font-sans text-body-sm font-semibold tracking-tight">
                  {column.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-underline text-soft text-body-sm transition-colors duration-feedback ease-standard hover:text-on-dark"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-soft text-soft mt-16 flex flex-col gap-2 border-t pt-6 text-body-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}. Minden jog fenntartva.
          </p>
          <p>Adószám: {company.taxNumber}</p>
        </div>
      </Container>
    </footer>
  );
}
