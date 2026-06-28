import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { company, contact } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Impresszum",
  description:
    "A Klivo üzemeltetőjének adatai és elérhetőségei az elektronikus kereskedelmi törvény szerint.",
  path: "/impresszum",
});

export default function ImpresszumPage() {
  return (
    <LegalPage
      title="Impresszum"
      lede="A weboldal üzemeltetőjének adatai."
      path="/impresszum"
      updated={company.effectiveDate}
    >
      <div className="legal-note">
        Ez egy sablon. A szögletes zárójeles [...] részeket valós cégadatokkal
        kell kitölteni, és érdemes a teljes szöveget szakemberrel ellenőriztetni
        az élesítés előtt.
      </div>

      <h2>A szolgáltató adatai</h2>
      <ul>
        <li>
          <strong>Név / cégnév:</strong> {company.legalName}
        </li>
        <li>
          <strong>Székhely:</strong> {company.seat}
        </li>
        <li>
          <strong>Képviselő:</strong> {company.representative}
        </li>
        <li>
          <strong>Adószám:</strong> {company.taxNumber}
        </li>
        <li>
          <strong>Cégjegyzék- / nyilvántartási szám:</strong>{" "}
          {company.registrationNumber}
        </li>
        <li>
          <strong>E-mail:</strong>{" "}
          <a href={contact.emailHref}>{contact.email}</a>
        </li>
        <li>
          <strong>Telefon:</strong> {contact.phone}
        </li>
      </ul>

      <h2>Tárhelyszolgáltató</h2>
      <p>{company.hostingProvider}</p>

      <h2>Jogszabályi háttér</h2>
      <p>
        A jelen impresszum az elektronikus kereskedelmi szolgáltatások, valamint
        az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről
        szóló 2001. évi CVIII. törvény (Ekertv.) rendelkezéseinek megfelelően
        készült.
      </p>

      <h2>Adatkezelés</h2>
      <p>
        A weboldalon keresztül megadott személyes adatok kezeléséről az{" "}
        <a href="/adatkezelesi-tajekoztato">Adatkezelési tájékoztató</a> ad
        részletes felvilágosítást. A szolgáltatás igénybevételének feltételeit az{" "}
        <a href="/aszf">Általános Szerződési Feltételek</a> tartalmazzák.
      </p>
    </LegalPage>
  );
}
