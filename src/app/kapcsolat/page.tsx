import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import ContactForm from "@/components/sections/ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Kapcsolat",
  description:
    "Kérj ingyenes ajánlatot a Klivótól: weboldal készítés, egyedi fejlesztés és tárhely. 24 órán belül válaszolunk.",
  path: "/kapcsolat",
});

export default function KapcsolatPage() {
  return (
    <>
      <section className="subhero">
        <div className="subhero__aura" aria-hidden="true">
          <span className="wash" />
        </div>
        <div className="container">
          <nav className="breadcrumb" aria-label="Útvonal">
            <Link href="/">Főoldal</Link>
            <CaretRight size={14} />
            <span aria-current="page">Kapcsolat</span>
          </nav>
          <h1 className="subhero__title">Beszéljük meg a projekted</h1>
          <p className="subhero__lede">
            Mondd el, mire van szükséged. Ingyenes, kötöttség nélküli ajánlatot
            készítünk, és 24 órán belül jelentkezünk.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
