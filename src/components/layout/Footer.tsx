import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";
import { site, contact } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link href="/" className="brand" aria-label="Klivo főoldal">
            <span className="brand__mark" aria-hidden="true">
              <BrandMark size={26} />
            </span>
            <span className="brand__name">Klivo</span>
          </Link>
          <p className="footer__tag">{site.tagline}</p>
          <p className="footer__tag">
            <a href={contact.emailHref}>{contact.email}</a>
          </p>
        </div>

        <nav className="footer__col" aria-label="Szolgáltatások">
          <h2 className="footer__title">Szolgáltatások</h2>
          <Link href="/weboldal-keszites">Weboldal készítés</Link>
          <Link href="/egyedi-fejlesztes">Egyedi fejlesztés</Link>
          <Link href="/tarhely">Tárhely és üzemeltetés</Link>
        </nav>

        <nav className="footer__col" aria-label="Klivo">
          <h2 className="footer__title">Klivo</h2>
          <Link href="/#folyamat">Folyamat</Link>
          <Link href="/#gyik">Gyakori kérdések</Link>
          <Link href="/kapcsolat">Kapcsolat</Link>
        </nav>

        <nav className="footer__col" aria-label="Jogi információk">
          <h2 className="footer__title">Jogi</h2>
          <Link href="/impresszum">Impresszum</Link>
          <Link href="/adatkezelesi-tajekoztato">Adatkezelési tájékoztató</Link>
          <Link href="/aszf">ÁSZF</Link>
        </nav>
      </div>

      <div className="container footer__bottom">
        <p>© {year} Klivo. Minden jog fenntartva.</p>
        <p>Magyarországon készült.</p>
      </div>
    </footer>
  );
}
