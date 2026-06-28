import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { company, contact } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Általános Szerződési Feltételek",
  description:
    "A Klivo weboldal készítési, egyedi fejlesztési és tárhely szolgáltatásainak általános szerződési feltételei.",
  path: "/aszf",
});

export default function AszfPage() {
  return (
    <LegalPage
      title="Általános Szerződési Feltételek"
      lede="A szolgáltatásaink igénybevételének feltételei."
      path="/aszf"
      updated={company.effectiveDate}
    >
      <div className="legal-note">
        Ez egy sablon. A szögletes zárójeles [...] részeket valós adatokkal kell
        kitölteni, és érdemes a teljes szöveget ügyvéddel ellenőriztetni az
        élesítés előtt.
      </div>

      <h2>1. A szolgáltató</h2>
      <p>
        Szolgáltató: {company.legalName}, székhely: {company.seat}, adószám:{" "}
        {company.taxNumber}. Elérhetőség:{" "}
        <a href={contact.emailHref}>{contact.email}</a>, {contact.phone}.
      </p>

      <h2>2. A szolgáltatások köre</h2>
      <ul>
        <li>
          <strong>Weboldal készítés:</strong> landing oldalak, bemutatkozó
          weboldalak és fullstack oldalak fejlesztése, 100 000 Ft-tól.
        </li>
        <li>
          <strong>Egyedi fejlesztés:</strong> webshopok, foglalási és
          jegyrendszerek, AI-integrációk és webalkalmazások egyedi árajánlat
          alapján.
        </li>
        <li>
          <strong>Tárhely és üzemeltetés:</strong> havi előfizetéses tárhely az
          általunk készített oldalakhoz (20 000 Ft / hó-tól) és külsős
          oldalakhoz (25 000 Ft / hó-tól).
        </li>
        <li>
          <strong>Módosítások óradíjban:</strong> az általunk üzemeltetett
          oldalakon végzett változtatások óradíjas elszámolással.
        </li>
      </ul>

      <h2>3. A szerződés létrejötte</h2>
      <p>
        Az ajánlatkérés nem kötelező érvényű. A szerződés akkor jön létre, amikor
        a Szolgáltató írásos (e-mailes) ajánlatát a Megrendelő írásban
        elfogadja. Az ajánlat tartalmazza a feladat leírását, a díjat és a
        teljesítési határidőt.
      </p>

      <h2>4. Díjazás és fizetési feltételek</h2>
      <p>
        A díjakat a mindenkori ajánlat tartalmazza. Fejlesztési projekteknél a
        Szolgáltató előleget kérhet, a fennmaradó összeg az átadáskor esedékes. A
        számla kiállítását követően a fizetési határidő [pl. 8 naptári nap],
        eltérő megállapodás hiányában. Az árak [bruttó / nettó] összegben
        értendők, az [esetleges] áfa feltüntetésével.
      </p>

      <h2>5. Tárhely előfizetés</h2>
      <p>
        A tárhely havi vagy [éves] előfizetés keretében vehető igénybe. Az
        előfizetés a díj megfizetésével indul, és a felmondásig él. A díj az
        oldal komplexitásától függ. A Szolgáltató rendszeres mentésről,
        biztonsági frissítésekről és a működés felügyeletéről gondoskodik.
      </p>

      <h2>6. Módosítások óradíjban</h2>
      <p>
        Az általunk üzemeltetett oldalakon végzett módosításokat (új tartalom,
        kép, kisebb funkció, javítás) óradíjban számlázzuk, a ténylegesen
        elvégzett munka alapján. Az óradíj mértékét az ajánlat vagy a
        keretszerződés tartalmazza. A nagyobb módosításokra a Megrendelő előzetes
        becslést kérhet, és a munka csak a jóváhagyás után indul.
      </p>

      <h2>7. Teljesítési határidők</h2>
      <p>
        A teljesítési határidőt az ajánlat rögzíti. A határidő a Megrendelő
        közreműködését (tartalmak, visszajelzések, hozzáférések biztosítása) is
        feltételezi; ezek késedelme a határidőt arányosan kitolhatja.
      </p>

      <h2>8. Szerzői jogok és felhasználási engedély</h2>
      <p>
        Az elkészült weboldal a teljes díj megfizetését követően a Megrendelő
        által korlátlan ideig használható. A Szolgáltató jogosult a munkát
        referenciaként feltüntetni, kivéve, ha a felek ettől eltérően
        állapodnak meg. A harmadik felektől származó elemekre (betűtípusok,
        képek, könyvtárak) azok saját licencfeltételei irányadók.
      </p>

      <h2>9. Felelősség</h2>
      <p>
        A Szolgáltató a tőle elvárható gondossággal jár el. Nem felel a
        Megrendelő által szolgáltatott tartalmak jogszerűségéért, a Megrendelő
        oldalán felmerülő hibákért, valamint a hatókörén kívül eső (pl. külső
        szolgáltatói, hálózati) kimaradásokért. A Szolgáltató felelőssége a
        vonatkozó projekt díjának összegére korlátozódik, a jogszabály által
        megengedett mértékben.
      </p>

      <h2>10. Elállás és felmondás</h2>
      <p>
        A tárhely előfizetés [pl. 30 napos] határidővel, írásban felmondható. A
        már megkezdett fejlesztési munka esetén a Megrendelő az addig elvégzett
        munka arányos díját köteles megfizetni. A fogyasztónak minősülő
        Megrendelőt a jogszabály szerinti elállási jog illeti meg, az ott
        meghatározott kivételekkel.
      </p>

      <h2>11. Panaszkezelés</h2>
      <p>
        Panaszodat a <a href={contact.emailHref}>{contact.email}</a> címen
        jelezheted, amelyet [pl. 30 napon] belül kivizsgálunk. Fogyasztói
        jogvita esetén a területileg illetékes békéltető testülethez is
        fordulhatsz.
      </p>

      <h2>12. Záró rendelkezések</h2>
      <p>
        A jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog, különösen a
        Polgári Törvénykönyv rendelkezései az irányadók. A Szolgáltató fenntartja
        a jogot az ÁSZF módosítására; a mindenkor hatályos változat ezen az
        oldalon érhető el.
      </p>
    </LegalPage>
  );
}
