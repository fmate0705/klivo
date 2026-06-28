import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, House } from "@phosphor-icons/react/dist/ssr";
import { primaryCta } from "@/lib/site";

export const metadata: Metadata = {
  title: "Az oldal nem található | Klivo",
  description: "A keresett oldal nem található. Lépj vissza a főoldalra.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="subhero notfound">
      <div className="subhero__aura" aria-hidden="true">
        <span className="wash" />
      </div>
      <div className="container notfound__inner">
        <p className="notfound__code" aria-hidden="true">
          404
        </p>
        <h1 className="subhero__title">Ez az oldal nem található</h1>
        <p className="subhero__lede">
          Lehet, hogy elavult a hivatkozás, vagy időközben átköltöztettük a
          tartalmat. Innen könnyen továbbléphetsz.
        </p>

        <div className="subhero__actions">
          <Link href="/" className="btn btn--primary btn--lg">
            <House size={18} weight="bold" />
            Vissza a főoldalra
          </Link>
          <Link href={primaryCta.href} className="btn btn--ghost btn--lg">
            {primaryCta.label}
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

        <nav className="notfound__links" aria-label="Hasznos oldalak">
          <Link href="/weboldal-keszites">Weboldal készítés</Link>
          <Link href="/egyedi-fejlesztes">Egyedi fejlesztés</Link>
          <Link href="/tarhely">Tárhely és üzemeltetés</Link>
          <Link href="/kapcsolat">Kapcsolat</Link>
        </nav>
      </div>
    </section>
  );
}
