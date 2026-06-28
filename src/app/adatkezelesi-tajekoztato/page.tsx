import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { company, contact } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Adatkezelési tájékoztató",
  description:
    "Hogyan kezeli a Klivo a kapcsolatfelvételkor megadott személyes adatokat. Jogalap, megőrzési idő, adatfeldolgozók és az érintett jogai (GDPR).",
  path: "/adatkezelesi-tajekoztato",
});

export default function AdatkezelesiPage() {
  return (
    <LegalPage
      title="Adatkezelési tájékoztató"
      lede="Hogyan kezeljük a megadott személyes adatokat, és milyen jogaid vannak."
      path="/adatkezelesi-tajekoztato"
      updated={company.effectiveDate}
    >
      <div className="legal-note">
        Ez egy sablon, amely egy egyszerű, kapcsolati űrlapot és tárhelyet
        használó weboldalra készült. A szögletes zárójeles [...] részeket valós
        adatokkal kell kitölteni, és érdemes adatvédelmi szakemberrel
        ellenőriztetni az élesítés előtt.
      </div>

      <h2>1. Az adatkezelő</h2>
      <p>
        Az adatkezelő a weboldal üzemeltetője: {company.legalName}, székhely:{" "}
        {company.seat}. Kapcsolat:{" "}
        <a href={contact.emailHref}>{contact.email}</a>, {contact.phone}.
      </p>

      <h2>2. Milyen adatokat kezelünk és milyen célból</h2>
      <p>
        A kapcsolati űrlap kitöltésekor a következő adatokat kezeljük, kizárólag
        azért, hogy felvegyük veled a kapcsolatot és ajánlatot adjunk:
      </p>
      <ul>
        <li>
          <strong>Név:</strong> a megszólításhoz és az ajánlat
          személyre szabásához.
        </li>
        <li>
          <strong>E-mail cím:</strong> a válaszadáshoz.
        </li>
        <li>
          <strong>Telefonszám (nem kötelező):</strong> ha telefonon
          egyeztetnél.
        </li>
        <li>
          <strong>Üzenet tartalma:</strong> a megkeresésed megértéséhez.
        </li>
      </ul>

      <h2>3. Az adatkezelés jogalapja</h2>
      <p>
        Az adatkezelés jogalapja a hozzájárulásod (GDPR 6. cikk (1) bekezdés a)
        pont), amelyet az űrlap elküldésével adsz meg, illetve a megkeresésedre
        adott válasz mint szerződéskötést megelőző lépés (GDPR 6. cikk (1)
        bekezdés b) pont). A hozzájárulásodat bármikor visszavonhatod.
      </p>

      <h2>4. Megőrzési idő</h2>
      <p>
        A kapcsolatfelvétel során megadott adatokat az ügy lezárásáig, illetve
        legfeljebb [pl. 12 hónapig] őrizzük meg, kivéve, ha jogszabály ennél
        hosszabb megőrzést ír elő, vagy szerződés jön létre (ekkor a számviteli
        és szerződéses kötelezettségek szerint).
      </p>

      <h2>5. Adatfeldolgozók</h2>
      <p>
        Az adatok kezeléséhez a következő közreműködőket vesszük igénybe:
      </p>
      <ul>
        <li>
          <strong>Tárhelyszolgáltató:</strong> {company.hostingProvider}
        </li>
        <li>
          <strong>E-mail (SMTP) szolgáltató:</strong> [a kapcsolati üzenetek
          továbbításához használt e-mail szolgáltató neve és elérhetősége]
        </li>
      </ul>

      <h2>6. Sütik (cookie-k)</h2>
      <p>
        A weboldal a működéséhez nem használ marketing- vagy nyomkövető sütiket.
        Amennyiben a jövőben analitikai vagy egyéb sütiket vezetünk be, erről
        külön tájékoztatást és hozzájárulási lehetőséget biztosítunk.
      </p>

      <h2>7. Az érintett jogai</h2>
      <p>A vonatkozó jogszabályok szerint jogosult vagy:</p>
      <ul>
        <li>tájékoztatást kérni a kezelt adataidról (hozzáférés joga),</li>
        <li>a pontatlan adatok helyesbítését kérni,</li>
        <li>az adataid törlését kérni („elfeledtetéshez való jog"),</li>
        <li>az adatkezelés korlátozását kérni,</li>
        <li>tiltakozni az adatkezelés ellen,</li>
        <li>a hozzájárulásodat bármikor visszavonni.</li>
      </ul>
      <p>
        Kéréseidet a <a href={contact.emailHref}>{contact.email}</a> címen
        jelezheted.
      </p>

      <h2>8. Jogorvoslat</h2>
      <p>
        Ha úgy érzed, hogy az adatkezelés sérti a jogaidat, panaszt tehetsz a
        Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH, 1055
        Budapest, Falk Miksa utca 9-11., weboldal: naih.hu), illetve bírósághoz
        is fordulhatsz.
      </p>

      <h2>9. A tájékoztató módosítása</h2>
      <p>
        Fenntartjuk a jogot a jelen tájékoztató módosítására. A mindenkor
        hatályos változat ezen az oldalon érhető el.
      </p>
    </LegalPage>
  );
}
