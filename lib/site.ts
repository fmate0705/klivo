/**
 * Klivo — a marketing tartalom egyetlen forrása.
 *
 * Itt él minden *szerkesztői* szöveg: szolgáltatások, folyamat, GYIK, navigáció.
 * Ezek megváltoztatása szövegírói döntés, tehát a kódban a helyük.
 *
 * Ami NEM itt él, mert üzemeltetői adat, és nem várhat egy deployra:
 *
 * - **Árak** — `lib/store/prices.ts` + admin (Árak).
 * - **Elérhetőség és cégadatok** (telefonszám, e-mail, székhely, adószám,
 *   tárhelyszolgáltató, hatálybalépés dátuma) — `lib/store/organization.ts`,
 *   `.env`-ből kezdőértékkel és az adminban (Cégadatok) felülírhatóan.
 *
 * Ezekre a modulokra a komponensek `getSettings()`-en keresztül jutnak el, nem
 * innen importálva.
 */

import type { PriceKey } from '@/lib/store/prices';

export const site = {
  name: 'Klivo',
  // A publikus origin a NEXT_PUBLIC_SITE_URL-ből jön (lásd `lib/site-url.ts`);
  // ez itt csak emberi olvasásra szolgáló alapérték.
  url: 'https://klivo.hu',
  locale: 'hu_HU',
  lang: 'hu',
  tagline: 'Weboldalak, amelyeket megtalálnak.',
  description:
    'A Klivo SEO-fókuszú magyar webügynökség: weboldal készítés, egyedi webalkalmazások és AI-integrációk, valamint tárhely és üzemeltetés. Fix ár, tiszta kommunikáció, gyors csapatmunka.',
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; desc: string }[];
};

export const nav: NavItem[] = [
  {
    label: 'Szolgáltatások',
    href: '/szolgaltatasok',
    children: [
      {
        label: 'Weboldal készítés',
        href: '/szolgaltatasok/weboldal-keszites',
        desc: 'Bemutatkozó és kampányoldalak, SEO-ra építve.',
      },
      {
        label: 'Egyedi fejlesztés és AI',
        href: '/szolgaltatasok/egyedi-fejlesztes',
        desc: 'Webalkalmazások, chatbotok, AI-integrációk.',
      },
      {
        label: 'Tárhely és üzemeltetés',
        href: '/szolgaltatasok/tarhely',
        desc: 'Hosting, napi mentés, havi statisztika.',
      },
    ],
  },
  { label: 'Folyamat', href: '/folyamat' },
  { label: 'Rólunk', href: '/rolunk' },
  { label: 'Blog', href: '/blog' },
  { label: 'Kapcsolat', href: '/kapcsolat' },
];

/** Egyetlen elsődleges szándék, egyetlen felirat az egész oldalon. */
export const primaryCta = { label: 'Kérj ajánlatot', href: '/kapcsolat' } as const;
export const secondaryCta = { label: 'Szolgáltatások', href: '/szolgaltatasok' } as const;

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

export const hero = {
  titleLines: ['Weboldal, amit', 'megtalálnak.'],
  // Rövid és konkrét. A hosszú bevezető a hero közepén senkit nem tart ott: a
  // részletek úgyis a következő szekcióban jönnek.
  subtitle: 'Megépítjük, üzemeltetjük, és a Google élére visszük. Fix áron.',
  rotatingPrefix: 'Építünk',
  rotatingWords: [
    'bemutatkozó oldalt',
    'kampányoldalt',
    'webshopot',
    'foglalási rendszert',
    'AI-chatbotot',
    'belső webalkalmazást',
  ],
  scrollCue: 'Görgess',
} as const;

/* -------------------------------------------------------------------------- */
/* Értékajánlat                                                                */
/* -------------------------------------------------------------------------- */

export const pillars = [
  {
    title: 'Megtalálnak a Google-ben',
    body: 'A keresőoptimalizálás nálunk nem felár, hanem az alap. Tiszta szerkezet, gyors betöltés, valódi tartalom — ettől kerül előre az oldalad, és ezért hoz ügyfelet.',
  },
  {
    title: 'Fix ár, meglepetés nélkül',
    body: 'Amiben megállapodunk, az marad. Az árat a munka előtt írásban rögzítjük, és nem emelünk rajta félúton, mert kiderült valami.',
  },
  {
    title: 'Nem kell értened hozzá',
    body: 'A kód, a szerver, a mentés és a frissítés a mi dolgunk. Te egy működő oldalt látsz, havonta pedig azt, hányan jártak rajta.',
  },
  {
    title: 'A tiéd marad',
    body: 'A domain a te nevedre szól, az oldal a te tulajdonod. Ha kéred a kódot, átadjuk — ha nem, nem kell foglalkoznod vele.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Folyamat                                                                    */
/* -------------------------------------------------------------------------- */

export const processSteps = [
  {
    title: 'Megkeresés',
    body: 'Elmondod, mire van szükséged. Ha van kész elképzelésed, abból indulunk. Ha nincs, mi tesszük le az első változatot.',
  },
  {
    title: 'Fix ajánlat',
    body: 'Átbeszéljük a terjedelmet, és írásban rögzítjük az árat és a határidőt. Ez az ár marad a projekt végéig.',
  },
  {
    title: 'Megépítjük',
    body: 'Nem tervrajzokat küldözgetünk, hanem működő oldalt építünk. A csapat párhuzamosan dolgozik rajta, ezért készül el gyorsan.',
  },
  {
    title: 'Átnézed, alakítunk',
    body: 'Megmutatjuk, te pedig elmondod, mit szeretnél máshogy. Addig módosítjuk, amíg valóban jó lesz.',
  },
  {
    title: 'Élesítés és üzemeltetés',
    body: 'A saját domainedre élesítjük, tárhelyet adunk alá, naponta mentünk, és havonta megküldjük a látogatói számokat.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Tulajdonjog                                                                 */
/* -------------------------------------------------------------------------- */

export const ownership = {
  title: 'Kié a weboldal?',
  intro:
    'A rövid válasz: a tiéd. A hosszabb válasz azért fontos, mert sok ügynökségnél nem ez a helyzet.',
  points: [
    {
      title: 'A domain a te nevedre szól',
      body: 'A domain a te tulajdonod marad, mi csak dolgozunk rajta. Nem a mi nevünkön áll, és nem kell tőlünk visszavásárolnod.',
    },
    {
      title: 'Az oldal a tiéd, a bonyodalom a miénk',
      body: 'Az elkészült oldal a te tulajdonod. Hogy közben mi fut a háttérben, az a mi dolgunk — neked egy jól működő, jól rangsorolt oldalt kell látnod.',
    },
    {
      title: 'A kódot bármikor kérheted',
      body: 'Ha kéred a forráskódot, átadjuk. Ha nem kéred, nem kell foglalkoznod vele. Egyik sem kerül külön pénzbe.',
    },
    {
      title: 'Ha elköszönünk, a kód veled megy',
      body: 'Ha a szerződés véget ér, és máshol folytatod az üzemeltetést, átadjuk a teljes kódot. Nem tartunk fogva senkit.',
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Szolgáltatások                                                              */
/* -------------------------------------------------------------------------- */

export type ServiceTier = {
  name: string;
  /** Az árat az admin szerkeszti; ez csak a hivatkozás rá. */
  priceKey: PriceKey;
  note?: string;
  includes: string[];
};

/**
 * Csomagon felüli tétel: extra oldal, extra funkció, domain.
 *
 * Külön szerepel az ársávoktól, mert nem választható csomag, hanem hozzáadható
 * költség. Egy listába keverve az olvasó azt hinné, hogy dönteni kell köztük.
 */
export type ServiceExtra = {
  label: string;
  priceKey: PriceKey;
  note?: string;
};

export type Service = {
  slug: string;
  title: string;
  /** Rövid összefoglaló kártyára (főoldal, navigáció). */
  summary: string;
  /** A kártyán megjelenő ár kulcsa. */
  priceKey: PriceKey;
  priceNote?: string;
  /** Kinek ajánljuk. */
  idealFor: string[];
  /** Amit mindig tartalmaz. */
  features: string[];
  /** Az aloldal bevezetője. */
  intro: string;
  /** Részletes blokkok az aloldalon. */
  detail: { title: string; body: string }[];
  pricing: {
    intro: string;
    tiers?: ServiceTier[];
    extras?: ServiceExtra[];
    factors: string[];
    closing: string;
  };
  /**
   * Az aloldal fejlécének háttérképe.
   *
   * Ahol van hozzá illő felület, ott az kerül ide (weboldalhoz weboldal,
   * webalkalmazáshoz vezérlőpult) — a fejléc így egy pillanat alatt megmutatja,
   * miről szól az oldal. A `Showcase` kiszűri ezt a képet a példák közül, hogy
   * ne szerepeljen kétszer ugyanazon az oldalon.
   */
  image: string;
};

export const services: Service[] = [
  {
    slug: 'weboldal-keszites',
    title: 'Weboldal készítés',
    summary:
      'Bemutatkozó oldalak, kampányoldalak és többoldalas weboldalak — mindegyik keresőre és ügyfélszerzésre építve.',
    priceKey: 'websiteFrom',
    priceNote: 'A pontos ár az oldal terjedelmétől és funkcióitól függ.',
    idealFor: [
      'Induló vállalkozásoknak',
      'Kkv-knak, akiknek nincs vagy elavult az oldaluk',
      'Szolgáltatóknak, szakembereknek',
      'Kampányhoz, új termék bevezetéséhez',
    ],
    features: [
      'Egyedi, márkára szabott megjelenés',
      'Mobilon is tökéletes, gyors betöltés',
      'Keresőoptimalizálás az első sortól',
      'Kapcsolati űrlap, e-mail értesítéssel',
      'Blog, ha kell — saját admin felülettel',
      'Élesítés a saját domainedre',
    ],
    intro:
      'Megépítjük a vállalkozásod weboldalát úgy, hogy gyors legyen, jól nézzen ki, és tényleg hozzon ügyfelet. Nem sablont töltünk fel: a szerkezetet a te szolgáltatásaidra és a te kereséseidre húzzuk rá.',
    detail: [
      {
        title: 'Először a keresés, utána a design',
        body: 'Megnézzük, mire keresnek rá az ügyfeleid, és a köré építjük az oldal szerkezetét. Egy szép oldal, amit nem találnak meg, csak egy drága névjegykártya.',
      },
      {
        title: 'Egyedi megjelenés, sablon nélkül',
        body: 'A márkádra szabott felületet tervezünk, nem kész témát húzunk rá. Mobilon és asztali gépen is ugyanolyan rendezett marad.',
      },
      {
        title: 'Gyors betöltés',
        body: 'Könnyű, optimalizált oldalakat építünk. A sebesség egyszerre kedvez a látogatónak és a keresőnek — és nem kell hozzá értened, csak érezni fogod.',
      },
      {
        title: 'Tartalom, ami elad',
        body: 'Segítünk megfogalmazni, mit csinálsz és miért téged válasszanak. A szövegeket együtt véglegesítjük, hogy a te hangodon szóljanak.',
      },
      {
        title: 'Blog és admin, ha kéred',
        body: 'Ha rendszeresen publikálnál, kapsz egy egyszerű admin felületet, amin fejlesztő nélkül tudsz bejegyzést írni. A blog a keresőben is dolgozik érted.',
      },
      {
        title: 'Élesítés és utána is',
        body: 'Az oldal a te domainedre kerül. Utána tárhelyet és üzemeltetést adunk alá, a módosításokat pedig előre megbeszélt óradíjban végezzük.',
      },
    ],
    pricing: {
      intro:
        'Négy csomag, kiírt árral. Amelyik a legközelebb áll ahhoz, amire szükséged van, azt vesszük alapul — az ajánlatot pedig a munka előtt írásban rögzítjük. Nincs rejtett tétel, és nem emelünk félúton.',
      tiers: [
        {
          name: 'Starter',
          priceKey: 'starter',
          note: '1–3 oldal · egyszerű landing',
          includes: [
            'Egy fókuszált landing vagy legfeljebb három aloldal',
            'Egyedi, márkára szabott megjelenés',
            'Mobilra és tabletre szabott elrendezés',
            'Kapcsolati űrlap, e-mail értesítéssel',
            'Keresőoptimalizálás alapjai: címek, leírások, sitemap',
            'Élesítés a saját domainedre',
          ],
        },
        {
          name: 'Business',
          priceKey: 'business',
          note: '1–5 oldal · értékesítésre hangolva',
          includes: [
            'Minden, ami a Starterben',
            'Legfeljebb öt aloldal, átgondolt navigációval',
            'Értékesítésre hangolt szerkezet: ajánlat, előnyök, GYIK, ajánlatkérés',
            'Kulcsszókutatás és belső linkelés',
            'Strukturált adatok a keresőknek és az AI-asszisztenseknek',
            'Google Analytics és Search Console bekötése',
          ],
        },
        {
          name: 'Professional',
          priceKey: 'professional',
          note: '1–10 oldal · profi termék- és sales oldal',
          includes: [
            'Minden, ami a Businessben',
            'Legfeljebb tíz aloldal, teljes tartalmi szerkezettel',
            'Kidolgozott termékoldal: érvek, összehasonlítás, bizalmi elemek',
            'Blog saját admin felülettel',
            'Finomabb animációk és részletesebb tartalmi munka',
            'Két kör közös finomhangolás az élesítés előtt',
          ],
        },
        {
          name: 'Custom',
          priceKey: 'custom',
          note: 'Egyedi felépítés, egyedi funkciók',
          includes: [
            'Minden, ami a Professionalben',
            'Egyedi oldalszerkezet, saját animációkkal',
            'Egyedi funkciók: kalkulátor, foglalás, ügyfélfiók',
            'AI-funkciók és külső rendszerek bekötése',
            'Saját admin felület a tartalomhoz',
            'Szakaszokra bontott ütemterv, végig látható haladással',
          ],
        },
      ],
      extras: [
        { label: 'Extra aloldal a csomagon felül', priceKey: 'extraPage' },
        { label: 'Extra funkció', priceKey: 'extraFeature' },
        {
          label: 'Domain',
          priceKey: 'domain',
          note: 'A regisztrátornál fizeted, a te nevedre.',
        },
      ],
      factors: [
        'Hány aloldal kell, és mennyi tartalom kerül rájuk',
        'Mennyire egyedi a megjelenés és az animáció',
        'Funkciók: űrlap, blog, több nyelv, integráció',
        'Kell-e szövegírás és képanyag',
        'Meglévő oldal vagy adat átköltöztetése',
      ],
      closing:
        'Az ajánlat fix. Ha menet közben új igény merül fel, azt külön tételként beárazzuk — de csak a te jóváhagyásoddal.',
    },
    image: '/images/work-restaurant.webp',
  },
  {
    slug: 'egyedi-fejlesztes',
    title: 'Egyedi fejlesztés és AI',
    summary:
      'Webalkalmazások, webshopok, foglalási rendszerek, AI-chatbotok és ügynök alapú megoldások — ami a böngészőben fut, azt megépítjük.',
    priceKey: 'customProject',
    priceNote: 'A feladat felmérése után adunk fix árat és ütemtervet.',
    idealFor: [
      'Webshopot indítóknak',
      'Foglalásra, jegyértékesítésre építőknek',
      'Belső folyamatot digitalizáló cégeknek',
      'AI-funkciót kereső csapatoknak',
    ],
    features: [
      'Igényfelmérés és műszaki tervezés',
      'Átlátható, saját admin felület',
      'Felhasználók és jogosultságok kezelése',
      'Fizetési és külső rendszer integrációk',
      'AI-chatbot és AI-ügynökök',
      'Tesztelés és dokumentáció',
    ],
    intro:
      'Ha a feladat túlmutat egy weboldalon, egyedi megoldást építünk. Ami a weben fut — webshop, portál, belső eszköz, AI-asszisztens —, azt meg tudjuk csinálni. Előbb felmérjük a folyamataidat, aztán adunk fix árat és ütemtervet.',
    detail: [
      {
        title: 'Webshop és online értékesítés',
        body: 'Termékkezelés, kosár, fizetés és rendeléskezelés — a te működésedre szabva, nem egy általános sablonra húzva.',
      },
      {
        title: 'Foglalás, jegyértékesítés',
        body: 'Időpont- és eseményfoglalás naptárral, automatikus visszaigazolással, és olyan adminnal, amit tényleg használni fogsz.',
      },
      {
        title: 'Webalkalmazások és portálok',
        body: 'Belső eszközök, ügyfélportálok, vezérlőpultok: felhasználókezeléssel, jogosultságokkal és automatizálással, pontosan a ti folyamataitokra.',
      },
      {
        title: 'AI-chatbot az oldaladon',
        body: 'Chatbot, amely a te tartalmaidból válaszol: árakról, szolgáltatásokról, nyitvatartásról. Leveszi az ismétlődő kérdéseket a csapatodról, és nem talál ki dolgokat.',
      },
      {
        title: 'AI-ügynökök és automatizálás',
        body: 'Beérkező üzenetek osztályozása, ajánlatok előkészítése, dokumentumok feldolgozása, tartalom előállítása. Olyan AI-funkciók, amelyek valódi munkaórát spórolnak.',
      },
      {
        title: 'Biztonság és bővíthetőség',
        body: 'Modern, biztonságos alapokra építünk, amelyek együtt nőnek a vállalkozásoddal. Az adataid nálad maradnak, nem szóródnak szét külső szolgáltatók között.',
      },
    ],
    pricing: {
      intro:
        'Az egyedi fejlesztésre mindig egyedi ajánlat készül, mert a feladatok nagyon eltérőek. Az ár a funkciók összetettségétől és a fejlesztési időtől függ. A kiindulás jellemzően a weboldal csomagok Custom szintje, plusz a szükséges funkciók.',
      extras: [
        { label: 'Extra funkció a felmérésen felül', priceKey: 'extraFeature' },
        {
          label: 'Üzemeltetés az átadás után',
          priceKey: 'hostingFrom',
          note: 'Tárhely, mentés, felügyelet — havi díjas.',
        },
        {
          label: 'AI- és API-költségek',
          priceKey: 'extraFeature',
          note: 'A szolgáltató felé, a tényleges használat alapján.',
        },
      ],
      factors: [
        'A funkciók száma és összetettsége',
        'Külső rendszerek és fizetés integrációja',
        'AI-funkciók megléte és mélysége',
        'Felhasználói szerepkörök és jogosultságok',
        'Várható adatmennyiség és terhelés',
      ],
      closing:
        'A felmérés után fix árat és ütemtervet kapsz. A nagyobb munkát szakaszokra bontjuk, hogy végig lásd, hol tartunk.',
    },
    image: '/images/work-dashboard.webp',
  },
  {
    slug: 'tarhely',
    title: 'Tárhely és üzemeltetés',
    summary:
      'Gyors tárhely, napi mentés, folyamatos felügyelet és havi látogatói statisztika. A más által készített oldalakat is átvesszük.',
    priceKey: 'hostingFrom',
    priceNote: 'Két csomag, havi díjjal. A külsős oldalakra felár és migrációs díj jön.',
    idealFor: [
      'Az általunk készített oldalakhoz',
      'Máshol készült, kész oldalakhoz',
      'Akinek nincs ideje a szerverrel foglalkozni',
    ],
    features: [
      'Tárhely és folyamatos üzemeltetés',
      'Napi biztonsági mentés',
      'Biztonsági és rendszerfrissítések',
      'Elérhetőség figyelése',
      'Havi látogatói statisztika',
      'Módosítások előre megbeszélt óradíjban',
    ],
    intro:
      'Az oldal nem ér véget az átadással. Tárhelyet adunk alá, figyeljük, hogy elérhető-e, naponta mentünk, és ha változtatni kell, gyorsan megcsináljuk. Nem számít, hogy mi építettük-e: kész oldalt is átveszünk.',
    detail: [
      {
        title: 'Tárhely, amiért nem kell aggódnod',
        body: 'Gyors kiszolgálás, hogy az oldalad mindig elérhető legyen. A rendelkezésre állás tartósan 98% fölött van, és ha valami mégis megáll, mi vesszük észre először.',
      },
      {
        title: 'Napi mentés',
        body: 'Minden nap készül mentés az oldalról és az adatokról. Ha bármi elromlik — hibás módosítás, támadás, emberi tévedés —, van hová visszaállni.',
      },
      {
        title: 'Karbantartás és frissítés',
        body: 'A biztonsági és rendszerfrissítéseket mi végezzük el. Ez az a munka, amit senki nem lát, amíg el nem marad.',
      },
      {
        title: 'Havi statisztika',
        body: 'Havonta megkapod a lényeget: hányan jártak az oldaladon, és merről érkeztek. Számok, amiket érdemes nézni — nem húsz oldalnyi mérőszám, amit senki nem olvas el.',
      },
      {
        title: 'Módosítások óradíjban',
        body: 'Új tartalom, kép, kisebb funkció vagy javítás: az általunk üzemeltetett oldalakon óradíjban végezzük. Az óradíjat a szerződés előtt közösen rögzítjük, tehát utólag nem érhet meglepetés.',
      },
      {
        title: 'Kész oldal átvétele',
        body: 'Más fejlesztő vagy ügynökség által készített oldalt is átveszünk és üzemeltetünk. Ilyenkor egyszeri migrációs díj és havi felár jön a csomag árához: a kódot meg kell ismernünk, és a felelősséget is átvesszük érte. A költözést mi bonyolítjuk, neked csak jóvá kell hagynod.',
      },
      {
        title: 'AI- és API-költségek külön',
        body: 'Ha az oldal AI-funkciót vagy fizetős külső szolgáltatást használ, annak a díja a szolgáltató felé megy, és a tényleges használat alapján számolódik. Nem tesszük rá a havidíjra, hogy lásd, mi mibe kerül.',
      },
    ],
    pricing: {
      intro:
        'Két üzemeltetési csomag, havi díjjal. Mindkettőben benne van a tárhely, a napi mentés és a felügyelet — a különbség a reagálás gyorsaságában és abban van, mennyi munkát viszünk el helyetted havonta.',
      tiers: [
        {
          name: 'Website Care',
          priceKey: 'careBasic',
          note: 'Alap üzemeltetés · havi díj',
          includes: [
            'Tárhely és folyamatos üzemeltetés',
            'Napi biztonsági mentés, visszaállítási lehetőséggel',
            'Biztonsági és rendszerfrissítések',
            'Elérhetőség figyelése, proaktív jelzéssel',
            'Havi látogatói statisztika e-mailben',
            'SSL tanúsítvány kezelése',
          ],
        },
        {
          name: 'Premium Care',
          priceKey: 'carePremium',
          note: 'Bővített üzemeltetés · havi díj',
          includes: [
            'Minden, ami a Website Care-ben',
            'Elsőbbségi hibakezelés: soron kívül nézzük meg',
            'Havi tartalmi frissítések elvégzése (szöveg, kép, ár)',
            'Negyedéves átnézés: sebesség, keresőben elfoglalt hely',
            'Sürgős kérésekre munkaidőn kívül is reagálunk',
          ],
        },
      ],
      extras: [
        {
          label: 'Máshol készült oldal — havi felár',
          priceKey: 'externalSurcharge',
          note: 'A választott csomag díjához adódik.',
        },
        {
          label: 'Máshol készült oldal — migrációs díj',
          priceKey: 'migrationFee',
          note: 'Egyszeri díj: az oldal megismerése és költöztetése.',
        },
        {
          label: 'Módosítások az üzemeltetett oldalon',
          priceKey: 'hourlyRate',
          note: 'A Premium Care havi keretén felül.',
        },
      ],
      factors: [
        'Az oldal mérete és technikai összetettsége',
        'A forgalom és az erőforrásigény',
        'Kell-e adatbázis, e-mail küldés, külső integráció',
        'Mi írtuk-e a kódot, vagy kívülről érkezik',
      ],
      closing:
        'A havidíjat, a felárat és az óradíjat a szerződés előtt írásban rögzítjük. Az AI- és API-költségek külön, a tényleges használat alapján számolódnak.',
    },
    image: '/images/hosting-layers.webp',
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Bemutató felületek                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Példák arra, milyen felületeket építünk.
 *
 * **Ezek illusztrációk, nem ügyfélmunkák.** A képek megrendelt oldalak helyett
 * azt mutatják be, milyen típusú felületről van szó, amikor „webshopról” vagy
 * „foglalási rendszerről” beszélünk. Ezt a szekció fejlécében ki is írjuk:
 * kitalált referenciát mutatni pontosan az a fajta apró hazugság, amitől egy
 * ügynökség hitelessége elveszik. Amikor lesz publikálható ügyfélmunka, ezek a
 * bejegyzések cserélhetők valós esettanulmányokra.
 */
export type ShowcaseItem = {
  image: string;
  title: string;
  body: string;
  /** Melyik szolgáltatás oldalán jelenjen meg. */
  service: 'weboldal-keszites' | 'egyedi-fejlesztes' | 'tarhely';
};

export const showcase: ShowcaseItem[] = [
  {
    image: '/images/work-business-site.webp',
    title: 'Többoldalas bemutatkozó oldal',
    body: 'Szolgáltatások, rólunk, kapcsolat — átgondolt navigációval és mobilra szabva. Ez a leggyakoribb választás: elmondja, mit csinálsz, és megkeresésre vezet.',
    service: 'weboldal-keszites',
  },
  {
    image: '/images/work-restaurant.webp',
    title: 'Bemutatkozó oldal, ami eladja a helyet',
    body: 'Nagy képek, tiszta menü, egyértelmű foglalás vagy hívás. Egy étterem, szalon vagy szolgáltató oldalán a döntés másodpercek kérdése — a szerkezetet erre húzzuk rá.',
    service: 'weboldal-keszites',
  },
  {
    image: '/images/work-webshop.webp',
    title: 'Webshop, ami mobilon is kényelmes',
    body: 'A vásárlások többsége telefonon indul. A terméklistát, a kosarat és a fizetést mobilra tervezzük először, és onnan bővítjük nagyobb képernyőre.',
    service: 'egyedi-fejlesztes',
  },
  {
    image: '/images/work-booking.webp',
    title: 'Foglalási felület, ami nem kér magyarázatot',
    body: 'Naptár, szabad idősávok, automatikus visszaigazolás. A vendég két kattintásból foglal, te pedig egy helyen látod az egészet.',
    service: 'egyedi-fejlesztes',
  },
  {
    image: '/images/work-dashboard.webp',
    title: 'Admin és kimutatások, amit tényleg használsz',
    body: 'Csak azok a számok, amelyek alapján döntesz. Nem húsz mérőszám, hanem az a néhány, ami a bevételt mozgatja.',
    service: 'egyedi-fejlesztes',
  },
];

/** A megadott szolgáltatáshoz tartozó példák. Ismeretlen slugra üres lista. */
export function showcaseFor(service: string): ShowcaseItem[] {
  return showcase.filter((item) => item.service === service);
}

/* -------------------------------------------------------------------------- */
/* Rólunk                                                                      */
/* -------------------------------------------------------------------------- */

export const about = {
  title: 'Kis csapat, egyenes beszéd',
  intro:
    'A Klivo egy magyar webügynökség. Weboldalakat és webalkalmazásokat építünk, és üzemeltetjük is őket. Nem vagyunk nagy ház, és nem is akarunk azok lenni: így tudunk gyorsan dolgozni és személyesen válaszolni.',
  values: [
    {
      title: 'Azt mondjuk, amit gondolunk',
      body: 'Ha valami nem éri meg neked, megmondjuk. Ha egy funkció szerintünk felesleges pénzkidobás, azt is. Egy jól működő oldalból lesz visszatérő ügyfél, nem egy felesleges tételből.',
    },
    {
      title: 'Az ár nem mozog',
      body: 'A megállapodott árat tartjuk. Ha új igény jön, azt előre beárazzuk, és csak a jóváhagyásod után kezdjük el.',
    },
    {
      title: 'Gyorsan dolgozunk',
      body: 'A csapat párhuzamosan halad a feladatokkal, ezért nem hetekig várunk egy-egy lépésre. A tempó nem a minőség rovására megy: minden oldalt ugyanazzal a mércével adunk ki a kezünkből.',
    },
    {
      title: 'A keresés van a fókuszban',
      body: 'Minden döntésnél azt nézzük, mit jelent a Google-ben elfoglalt helyedre és az érdeklődőkre. Ez a különbség egy szép oldal és egy hasznos oldal között.',
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Gyakori kérdések                                                            */
/* -------------------------------------------------------------------------- */

export const faqs = [
  {
    q: 'Mennyibe kerül egy weboldal?',
    a: 'Négy csomagunk van, mindegyiknél kiírt árral: Starter, Business, Professional és Custom. A pontos árakat és azt, hogy melyik mit tartalmaz, a weboldal készítés oldalon találod. Amelyik a legközelebb áll az igényedhez, azt vesszük alapul, és arra adunk fix ajánlatot, mielőtt belekezdünk.',
  },
  {
    q: 'Változhat az ár menet közben?',
    a: 'Nem. Amiben megállapodunk, azt tartjuk. Ha te kérsz olyan új funkciót, ami nem volt része az ajánlatnak, azt külön beárazzuk, és csak a jóváhagyásod után kezdjük el.',
  },
  {
    q: 'Kell értenem a technikához?',
    a: 'Nem. A kód, a szerver, a mentés és a frissítés a mi dolgunk. Neked egy működő oldalt kell látnod, és havonta a látogatói számokat.',
  },
  {
    q: 'Kié lesz a weboldal és a kód?',
    a: 'A domain a te nevedre szól, az oldal a te tulajdonod. A forráskódot bármikor elkérheted, és ha a szerződés véget ér, akkor is átadjuk. Egyik sem kerül külön pénzbe.',
  },
  {
    q: 'Mit tartalmaz az üzemeltetés?',
    a: 'A Website Care csomag tárhelyet, folyamatos üzemeltetést, napi biztonsági mentést, biztonsági és rendszerfrissítéseket, az elérhetőség figyelését és havi látogatói statisztikát tartalmaz. A Premium Care ezen felül elsőbbségi hibakezelést, havi tartalmi frissítéseket és negyedéves átnézést ad. Az AI- és API-költségek külön, a tényleges használat alapján számolódnak.',
  },
  {
    q: 'Át tudjátok venni a meglévő oldalamat?',
    a: 'Igen. Más által készített, kész oldalt is átveszünk és üzemeltetünk. Ilyenkor egy egyszeri migrációs díj és egy havi felár jön a választott csomag árához: a kódot meg kell ismernünk, és a felelősséget is átvesszük érte. A költöztetést mi bonyolítjuk, és előre megmondjuk, mi kell hozzá.',
  },
  {
    q: 'Mennyi idő alatt készül el?',
    a: 'Egy egyoldalas kampányoldal jellemzően napok kérdése, egy többoldalas bemutatkozó oldal néhány hét. Az egyedi fejlesztések ütemtervét a felmérés után, az ajánlatban rögzítjük.',
  },
  {
    q: 'Tudtok AI funkciót építeni az oldalamba?',
    a: 'Igen. Chatbotot, amely a te tartalmaidból válaszol, illetve AI-ügynököket, amelyek az ismétlődő munkát végzik el: üzenetek osztályozása, ajánlatok előkészítése, dokumentumok feldolgozása.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Bizalmi jelzések                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Egyetlen szám kerül ki az oldalra, és az is olyan, aminek van jelentése egy
 * megrendelőnek: a rendelkezésre állás. Technikai mérőszámokat (LCP, CLS és
 * társai) szándékosan nem mutatunk — nem mondanak semmit annak, aki nem
 * fejlesztő.
 */
export const assurances = [
  {
    title: 'Elérhető oldal',
    body: 'A rendelkezésre állás tartósan 98% fölött van, és mi figyeljük, nem te.',
  },
  {
    title: 'Napi mentés',
    body: 'Minden nap készül mentés, tehát mindig van hová visszaállni.',
  },
  {
    title: 'Havi statisztika',
    body: 'Havonta megkapod, hányan jártak az oldaladon, és merről jöttek.',
  },
  {
    title: 'Egy ár, előre',
    body: 'A díjakat a szerződés előtt rögzítjük — az óradíjat is.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Jogi oldalak                                                                */
/* -------------------------------------------------------------------------- */

export const legalPages = [
  { slug: 'impresszum', title: 'Impresszum' },
  { slug: 'aszf', title: 'Általános szerződési feltételek' },
  { slug: 'adatkezelesi-tajekoztato', title: 'Adatkezelési tájékoztató' },
  { slug: 'cookie-tajekoztato', title: 'Cookie tájékoztató' },
] as const;

export type LegalSlug = (typeof legalPages)[number]['slug'];
