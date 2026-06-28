/**
 * Klivo — központi tartalmi és konfigurációs forrás ("single source of truth").
 * Itt él minden szöveg, ár, navigáció és cégadat, hogy az oldalakon ne legyen
 * elszórva magic string. A PLACEHOLDER jelölésű értékek valós adatra cserélendők.
 */

export const site = {
  name: "Klivo",
  // PLACEHOLDER: valós domainre cserélendő (canonical, OG, sitemap, JSON-LD).
  url: "https://klivo.hu",
  locale: "hu_HU",
  lang: "hu",
  tagline: "Weboldalak, amelyeket megtalálnak.",
  description:
    "A Klivo modern magyar webügynökség: weboldal készítés és honlapkészítés, egyedi webfejlesztés és tárhely. Erős SEO és AI-láthatóság, hogy a Google és az AI-keresők is a vállalkozásodat ajánlják.",
} as const;

/** Kapcsolati adatok. PLACEHOLDER: mind valós adatra cserélendő. */
export const contact = {
  email: "hello@klivo.hu",
  phone: "+36 30 000 0000",
  phoneHref: "tel:+36300000000",
  emailHref: "mailto:hello@klivo.hu",
  areaServed: "Magyarország",
  hours: "Hétköznap 9:00 és 17:00 között",
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; desc: string }[];
};

export const nav: NavItem[] = [
  {
    label: "Szolgáltatások",
    href: "/#szolgaltatasok",
    children: [
      {
        label: "Weboldal készítés",
        href: "/weboldal-keszites",
        desc: "Landing és bemutatkozó oldalak, 100 000 Ft-tól.",
      },
      {
        label: "Egyedi fejlesztés",
        href: "/egyedi-fejlesztes",
        desc: "Webshop, webalkalmazás, AI-integráció.",
      },
      {
        label: "Tárhely és üzemeltetés",
        href: "/tarhely",
        desc: "Hosting és módosítások óradíjban.",
      },
    ],
  },
  { label: "Folyamat", href: "/#folyamat" },
  { label: "Gyakori kérdések", href: "/#gyik" },
  { label: "Kapcsolat", href: "/kapcsolat" },
];

/** Egységes elsődleges CTA (egy intent, egy felirat az egész oldalon). */
export const primaryCta = { label: "Kérj ajánlatot", href: "/kapcsolat" } as const;

export type ServiceTier = {
  name: string;
  price: string;
  note?: string;
  includes: string[];
};

export type ServicePricing = {
  /** Az árazási modell rövid bemutatása. */
  intro: string;
  /** Opcionális ársávok / csomagok. */
  tiers?: ServiceTier[];
  /** Mi befolyásolja a végső árat. */
  factors: string[];
  /** Záró megjegyzés (pl. fix ajánlat, óradíj). */
  closing?: string;
};

export type Service = {
  slug: string;
  title: string;
  /** Rövid, kártyára való összefoglaló (home + nav). */
  summary: string;
  priceLabel: string;
  priceNote?: string;
  /** Kinek ajánljuk (rövid címkék). */
  idealFor: string[];
  /** Mindig benne van (alap feature-lista). */
  features: string[];
  /** A részletes aloldal bevezetője. */
  intro: string;
  /** Részletes blokkok az aloldalon. */
  detail: { title: string; body: string }[];
  /** Részletes árazás. */
  pricing: ServicePricing;
};

export const services: Service[] = [
  {
    slug: "weboldal-keszites",
    title: "Weboldal készítés",
    summary:
      "Landing oldalak, bemutatkozó weboldalak és fullstack oldalak, a céljaidra szabva.",
    priceLabel: "100 000 Ft-tól",
    priceNote: "A pontos ár az oldal terjedelmétől és funkcióitól függ.",
    idealFor: [
      "Induló vállalkozásoknak",
      "Kkv-knak",
      "Szabadúszóknak és szakembereknek",
      "Kampányoldalhoz",
    ],
    features: [
      "Egyedi, márkára szabott design",
      "Reszponzív, mobilra optimalizált megjelenés",
      "Beépített SEO és AI-láthatóság",
      "Gyors betöltés, kiváló Core Web Vitals",
      "Akadálymentességi alapok",
      "Kapcsolati űrlap e-mail küldéssel",
      "Átadás és rövid betanítás",
    ],
    intro:
      "Megépítjük a vállalkozásod weboldalát úgy, hogy gyors legyen, jól nézzen ki, és tényleg ügyfeleket hozzon. Az egyszerű, fókuszált landing oldaltól a többoldalas bemutatkozó oldalig és a blogot, e-mailt is kezelő fullstack oldalig. Minden oldalt a célodra szabunk, és az első sortól beépítjük a SEO-t és az AI-láthatóságot.",
    detail: [
      {
        title: "Egyedi, sablonmentes design",
        body: "A márkádra szabott megjelenést tervezünk, nem kész témát töltünk fel. Mobilon és asztali gépen is tökéletesen néz ki, és olyan szerkezetre épül, amit a keresők és az AI-asszisztensek is könnyen értelmeznek.",
      },
      {
        title: "Landing oldal",
        body: "Egyetlen, konverzióra hangolt oldal: erős üzenet, tiszta felépítés, jól látható ajánlatkérés. Ideális kampányhoz, új termékhez vagy szolgáltatáshoz, amikor egy célra akarsz fókuszálni.",
      },
      {
        title: "Bemutatkozó, többoldalas oldal",
        body: "Több aloldal (például szolgáltatások, rólunk, referenciák, kapcsolat) átgondolt navigációval. Akkor jó választás, ha a cégedet és a teljes kínálatodat részletesen be akarod mutatni.",
      },
      {
        title: "Fullstack oldal",
        body: "Dinamikus oldal blogkezeléssel és e-mail küldéssel, például hírlevél-feliratkozással vagy automatikus visszaigazolással. Bővíthető alapokra építjük, hogy később is egyszerű legyen új funkciókkal bővíteni.",
      },
      {
        title: "SEO és AI-láthatóság beépítve",
        body: "Strukturált adatok, tiszta címsorhierarchia, sitemap és llms.txt, hogy a Google és az AI-keresők is megtalálják és ajánlják az oldalad. Ez nálunk alap, nem felár.",
      },
      {
        title: "Sebesség és karbantarthatóság",
        body: "Optimalizált, könnyű oldalakat építünk kiváló Core Web Vitals értékekkel, modern és biztonságos technológiával, amely évek múlva is stabilan működik.",
      },
    ],
    pricing: {
      intro:
        "A weboldal készítés 100 000 Ft-tól indul. A végső ár az oldal terjedelmétől és a kívánt funkcióktól függ, ezért minden projektre fix árajánlatot adunk, mielőtt belekezdünk.",
      tiers: [
        {
          name: "Landing oldal",
          price: "100 000 Ft-tól",
          note: "Egy fókuszált oldal",
          includes: [
            "Egyedi, egyoldalas design",
            "Kapcsolati űrlap",
            "SEO és AI-láthatóság alapok",
          ],
        },
        {
          name: "Bemutatkozó oldal",
          price: "Egyedi ajánlat",
          note: "Több aloldal",
          includes: [
            "Több aloldal és navigáció",
            "Bővebb tartalomszerkezet",
            "Erősebb SEO",
          ],
        },
        {
          name: "Fullstack oldal",
          price: "Egyedi ajánlat",
          note: "Blog és e-mail",
          includes: [
            "Blogkezelés",
            "E-mail küldés, űrlapok",
            "Dinamikus tartalom",
          ],
        },
      ],
      factors: [
        "Az aloldalak száma és a tartalom mennyisége",
        "Az egyedi design és animációk mélysége",
        "Funkciók: űrlapok, blog, többnyelvűség, integrációk",
        "Szövegírás és képanyag igénye",
        "Meglévő oldal vagy adat átköltöztetése",
      ],
      closing:
        "Az árajánlat fix, és minden tételt előre tisztázunk. Nincs rejtett költség, és csak azt fizeted, amiben megállapodtunk.",
    },
  },
  {
    slug: "egyedi-fejlesztes",
    title: "Egyedi weboldal és webalkalmazás",
    summary:
      "Webshopok, foglalási és jegyrendszerek, AI-chatbot és teljes webalkalmazások, jellemzően admin felülettel.",
    priceLabel: "Egyedi árajánlat",
    priceNote: "Telefonon vagy e-mailben, a feladat felmérése után.",
    idealFor: [
      "Webshopot indítóknak",
      "Foglalásra vagy jegyértékesítésre építőknek",
      "Belső folyamatot digitalizáló cégeknek",
      "AI-funkciókat kereső csapatoknak",
    ],
    features: [
      "Igényfelmérés és műszaki tervezés",
      "Egyedi, átlátható admin felület",
      "Felhasználókezelés és jogosultságok",
      "Fizetési és külső rendszer integrációk",
      "Opcionális AI-funkciók",
      "Tesztelés és dokumentáció",
    ],
    intro:
      "Ha a feladat túlmutat egy weboldalon, egyedi megoldást építünk. Webshoptól a foglalási és jegyrendszereken át a teljes webalkalmazásokig, igény szerint AI-funkciókkal és saját admin felülettel. Először felmérjük a folyamataidat, majd pontos ajánlatot és ütemtervet adunk.",
    detail: [
      {
        title: "Webshop és online értékesítés",
        body: "Termékkezelés, kosár, fizetés és átlátható rendeléskezelés. Akár néhány termékkel indulsz, akár nagyobb katalógussal dolgozol, a rendszert a te működésedre szabjuk.",
      },
      {
        title: "Foglalási és jegyrendszerek",
        body: "Időpontfoglalás, esemény- és jegyértékesítés naptárral, automatikus visszaigazolással és könnyen kezelhető adminisztrációval.",
      },
      {
        title: "Webalkalmazások és portálok",
        body: "Egyedi belső eszközök, ügyfélportálok és vezérlőpultok felhasználókezeléssel, jogosultságokkal és automatizálással, pontosan a ti folyamataitokra szabva.",
      },
      {
        title: "AI-integráció",
        body: "Chatbot, automatikus tartalomkezelés, ügyfélszolgálati asszisztens vagy dokumentum-feldolgozás. Olyan AI-funkciók, amelyek valódi munkát vesznek le a csapatodról.",
      },
      {
        title: "Saját admin felület",
        body: "Minden egyedi megoldáshoz átlátható admin felületet kapsz, hogy magabiztosan kezeld a tartalmat, a rendeléseket vagy a felhasználókat, fejlesztő nélkül is.",
      },
      {
        title: "Biztonság és skálázhatóság",
        body: "Modern, biztonságos alapokra építünk, amelyek együtt nőnek a vállalkozásoddal, és bírják a növekvő forgalmat.",
      },
    ],
    pricing: {
      intro:
        "Az egyedi fejlesztés mindig egyedi árajánlat alapján készül, mert a feladatok nagyon eltérőek. Az ár a funkciók összetettségétől és a fejlesztési időtől függ. Az alábbi sávok a tájékozódást segítik.",
      tiers: [
        {
          name: "Kisebb projekt",
          price: "Egyedi ajánlat",
          note: "Néhány hét",
          includes: [
            "Egy jól körülhatárolt funkció",
            "Például foglalás vagy egyszerű webshop",
            "Alap admin felület",
          ],
        },
        {
          name: "Közepes projekt",
          price: "Egyedi ajánlat",
          note: "Több modul",
          includes: [
            "Több összefüggő modul",
            "Teljes admin felület",
            "Külső rendszer integrációk",
          ],
        },
        {
          name: "Nagy projekt",
          price: "Egyedi ajánlat",
          note: "Több hónap",
          includes: [
            "Teljes webalkalmazás",
            "AI-funkciók",
            "Skálázható architektúra",
          ],
        },
      ],
      factors: [
        "A funkciók száma és összetettsége",
        "Külső rendszerek és fizetés integrációja",
        "AI-funkciók megléte és mélysége",
        "Felhasználói szerepkörök és jogosultságok",
        "Várható adatmennyiség és terhelés",
      ],
      closing:
        "A felmérés után fix árat és ütemtervet kapsz. A nagyobb projekteket szakaszokra bontjuk, hogy a fejlesztés átlátható és kiszámítható maradjon.",
    },
  },
  {
    slug: "tarhely",
    title: "Tárhely és üzemeltetés",
    summary:
      "Megbízható tárhely és üzemeltetés. A meglévő oldaladat is átvesszük, a módosításokat pedig óradíjban végezzük.",
    priceLabel: "20 000 Ft / hó-tól",
    priceNote: "A pontos díj az oldal komplexitásától függ.",
    idealFor: [
      "Klivo-ügyfeleknek",
      "Meglévő oldalt költöztetőknek",
      "Gondtalan üzemeltetést keresőknek",
    ],
    features: [
      "Gyors, stabil tárhely",
      "Rendszeres biztonsági mentések",
      "Biztonsági és rendszerfrissítések",
      "Működés- és elérhetőség-figyelés",
      "Gyors support",
      "Módosítások óradíjban",
    ],
    intro:
      "Az oldalad nem ér véget az átadással. Stabil, gyors tárhelyet biztosítunk, figyeljük a működést, rendszeresen mentünk és frissítünk, és amikor változtatni kell, óradíjban gyorsan elvégezzük a módosításokat. Akár mi készítettük az oldalt, akár más.",
    detail: [
      {
        title: "Megbízható, gyors kiszolgálás",
        body: "Stabil tárhely, hogy az oldalad mindig elérhető és villámgyors legyen. A sebesség a SEO-nak és a látogatói élménynek is jót tesz.",
      },
      {
        title: "Mentések és frissítések",
        body: "Rendszeres biztonsági mentés, valamint biztonsági és rendszerfrissítések, hogy egy hiba vagy támadás se okozzon fennakadást. Te ezzel nem foglalkozol, mi intézzük.",
      },
      {
        title: "Működésfigyelés",
        body: "Figyeljük az oldal elérhetőségét és teljesítményét, és proaktívan jelzünk, ha valami nem stimmel, mielőtt az ügyfeleid észrevennék.",
      },
      {
        title: "Módosítások óradíjban",
        body: "Új tartalom, kép, kisebb funkció vagy javítás: a hostolt oldalakon a változtatásokat óradíjban végezzük, átlátható elszámolással. Csak a tényleges munkát fizeted, nagyobb feladatra pedig előre becslést adunk.",
      },
      {
        title: "Külsős oldalak átvétele",
        body: "Más fejlesztő vagy ügynökség által készített oldalt is átveszünk és üzemeltetünk. A költözés zökkenőmentes, a működés stabil.",
      },
    ],
    pricing: {
      intro:
        "A tárhely havi előfizetés, az ára az oldal komplexitásától függ. A módosításokat óradíjban, átlátható elszámolással végezzük.",
      tiers: [
        {
          name: "Saját ügyfeleknek",
          price: "20 000 Ft / hó-tól",
          note: "Általunk készített oldalakhoz",
          includes: [
            "Tárhely és üzemeltetés",
            "Mentések és frissítések",
            "Működésfigyelés",
          ],
        },
        {
          name: "Külsős oldalaknak",
          price: "25 000 Ft / hó-tól",
          note: "Más által készített oldalakhoz",
          includes: [
            "Oldal zökkenőmentes átvétele",
            "Tárhely és üzemeltetés",
            "Mentések és frissítések",
          ],
        },
        {
          name: "Módosítások",
          price: "Óradíjban",
          note: "A hostolt oldalakon",
          includes: ["Új tartalom és kép", "Kisebb funkciók", "Javítások, finomítások"],
        },
      ],
      factors: [
        "Az oldal mérete és technikai komplexitása",
        "A forgalom és az erőforrásigény",
        "A kért rendelkezésre állás és support szint",
      ],
      // PLACEHOLDER: ha szeretnél konkrét óradíjat megjeleníteni, írd be ide a
      // záró mondatba (pl. "Óradíj: X XXX Ft / óra").
      closing:
        "A havidíjat és az óradíjat előre, írásban rögzítjük, hogy kiszámítható legyen. Az óradíj pontos összegét a megrendelővel egyeztetve adjuk meg.",
    },
  },
];

export const processSteps = [
  {
    title: "Konzultáció",
    body: "Megértjük a céljaidat és a közönséged. Ingyenes és kötöttség nélküli.",
  },
  {
    title: "Ajánlat és terv",
    body: "Fix árat és világos ütemtervet adunk. Nincs rejtett költség.",
  },
  {
    title: "Design és fejlesztés",
    body: "Megépítjük a gyors, SEO-barát oldalt, közben végig látod a haladást.",
  },
  {
    title: "Élesítés és átadás",
    body: "Teszteljük, optimalizáljuk és élesítjük. Megmutatjuk, hogyan kezeld.",
  },
  {
    title: "Tárhely és támogatás",
    body: "Üzemeltetjük és karbantartjuk, a módosításokat pedig óradíjban végezzük.",
  },
] as const;

export const faqs = [
  {
    q: "Mennyibe kerül egy weboldal?",
    a: "A weboldal készítés 100 000 Ft-tól indul, az ár az oldal terjedelmétől és funkcióitól függ. Egyedi fejlesztésekre (webshop, webalkalmazás, AI-integráció) személyre szabott árajánlatot adunk telefonon vagy e-mailben.",
  },
  {
    q: "Mi az az AI SEO, és miért fontos?",
    a: "Az AI SEO azt jelenti, hogy a weboldalt úgy építjük fel, hogy az AI-alapú keresők és asszisztensek (ChatGPT, Gemini, Perplexity) is könnyen megértsék és ajánlják. Ehhez tiszta, szemantikus szerkezetet, strukturált adatokat és gépek számára is jól olvasható tartalmat használunk.",
  },
  {
    q: "Mennyi idő alatt készül el egy weboldal?",
    a: "Egy landing oldal jellemzően 1 vagy 2 hét, egy összetettebb, többoldalas vagy fullstack oldal 3 és 6 hét között készül el. Az egyedi webalkalmazások ütemtervét a konzultáció után, az ajánlatban rögzítjük.",
  },
  {
    q: "Kell külön fizetni a tárhelyért?",
    a: "A tárhely havi előfizetés. Az általunk készített oldalakhoz 20 000 Ft-tól, külsős (más által fejlesztett) oldalakhoz 25 000 Ft-tól biztosítunk megbízható tárhelyet, az oldal komplexitásától függően.",
  },
  {
    q: "Tudtok módosítani a már kész oldalon?",
    a: "Igen. Az általunk hostolt oldalakon a módosításokat (új tartalom, kép, kisebb funkció, javítás) óradíjban végezzük, átlátható elszámolással. Csak a tényleges munkát fizeted.",
  },
  {
    q: "Át tudtok venni egy meglévő, más által készített oldalt?",
    a: "Igen. A külsős tárhely szolgáltatásunk pontosan erre való: más fejlesztő vagy ügynökség által készített oldalakat is átveszünk és üzemeltetünk, 25 000 Ft-tól.",
  },
] as const;

/**
 * Cégadatok az Impresszumhoz és a jogi oldalakhoz.
 * PLACEHOLDER: minden mezőt valós adatra kell cserélni indulás előtt,
 * és a jogi szövegeket szakemberrel (ügyvéddel) érdemes ellenőriztetni.
 */
export const company = {
  legalName: "Klivo [cégforma: Kft. / egyéni vállalkozó]",
  seat: "[irányítószám] [település], [utca, házszám]",
  taxNumber: "[adószám]",
  registrationNumber: "[cégjegyzékszám vagy nyilvántartási szám]",
  representative: "[képviselő neve]",
  email: contact.email,
  phone: contact.phone,
  hostingProvider:
    "[tárhelyszolgáltató neve, székhelye és elérhetősége, pl. a VPS-szolgáltató]",
  effectiveDate: "2026. június 24.",
} as const;
