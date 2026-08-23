/**
 * Cégadatok, elérhetőség és jogi adatok — **kizárólag a `.env` fájlból**.
 *
 * Ez a modul a jogi és kapcsolati adatok egyetlen forrása. Ami itt megjelenik,
 * az jelenik meg a láblécben, a kapcsolat oldalon, az impresszumban, az ÁSZF-ben,
 * az adatkezelési és a cookie tájékoztatóban, valamint a keresőknek küldött
 * strukturált adatban.
 *
 * Egyetlen szerkesztési pont van: a `.env` fájl. Nincs mögötte admin felület és
 * nincs adatbázis, mert két szerkesztési hely két egymásnak ellentmondó
 * impresszumot jelentene, és senki nem tudná, melyik az igazi. A `.env`
 * átírása után a konténert újra kell indítani.
 *
 * Ha egy érték nincs kitöltve, `[szögletes zárójeles]` helyőrző marad. Ez
 * szándékos: az azonnal látszik az oldalon, tehát nem lehet véletlenül
 * kitöltetlen cégadatokkal élesíteni. Kitalált adatot a modul soha nem ad
 * vissza.
 *
 * A modul függőségmentes (semmi `node:fs`), ezért szerver- és kliensoldalon
 * egyaránt importálható — a `NEXT_PUBLIC_` előtagú mezők a böngészőbe is
 * eljutnak.
 */

export type Contact = {
  email: string;
  phone: string;
  areaServed: string;
  hours: string;
  responseTime: string;
};

export type Company = {
  legalName: string;
  seat: string;
  taxNumber: string;
  registrationNumber: string;
  representative: string;
  bank: string;
  hostingProvider: string;
  supervisoryAuthority: string;
  disputeResolution: string;
  noticePeriod: string;
  leadRetention: string;
  logRetention: string;
  effectiveDate: string;
};

export type Organization = {
  contact: Contact;
  company: Company;
};

/**
 * A környezeti változók olvasása.
 *
 * A `process.env.X` alakot NEM lehet dinamikus kulccsal írni: a Next.js a
 * kliens bundle-ben szövegesen cseréli le ezeket a hivatkozásokat, és egy
 * `process.env[valtozo]` alakot nem tud felismerni. Ezért van itt egy explicit
 * leképezés, kulcsonként egy sorral.
 */
function fromEnv(): Partial<Contact & Company> {
  return {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
    areaServed: process.env.CONTACT_AREA_SERVED,
    hours: process.env.CONTACT_HOURS,
    responseTime: process.env.CONTACT_RESPONSE_TIME,
    legalName: process.env.COMPANY_LEGAL_NAME,
    seat: process.env.COMPANY_SEAT,
    taxNumber: process.env.COMPANY_TAX_NUMBER,
    registrationNumber: process.env.COMPANY_REGISTRATION_NUMBER,
    representative: process.env.COMPANY_REPRESENTATIVE,
    bank: process.env.COMPANY_BANK,
    hostingProvider: process.env.COMPANY_HOSTING_PROVIDER,
    supervisoryAuthority: process.env.COMPANY_SUPERVISORY_AUTHORITY,
    disputeResolution: process.env.COMPANY_DISPUTE_RESOLUTION,
    noticePeriod: process.env.COMPANY_NOTICE_PERIOD,
    leadRetention: process.env.COMPANY_LEAD_RETENTION,
    logRetention: process.env.COMPANY_LOG_RETENTION,
    effectiveDate: process.env.COMPANY_EFFECTIVE_DATE,
  };
}

/**
 * Helyőrzők. Ezek jelennek meg, amíg a `.env` üresen áll — szándékosan
 * felismerhetően, hogy ne lehessen őket valódi adatnak nézni.
 */
const PLACEHOLDERS: Organization = {
  contact: {
    email: '[e-mail cím]',
    phone: '[telefonszám]',
    areaServed: 'Magyarország',
    hours: '[ügyfélfogadási idő]',
    responseTime: 'Egy munkanapon belül válaszolunk.',
  },
  company: {
    legalName: '[teljes cégnév]',
    seat: '[irányítószám] [település], [utca, házszám]',
    taxNumber: '[adószám]',
    registrationNumber: '[cégjegyzékszám vagy nyilvántartási szám]',
    representative: '[képviselő neve]',
    bank: '[számlavezető bank és számlaszám]',
    hostingProvider: '[a tárhelyszolgáltató neve, székhelye és elérhetősége]',
    supervisoryAuthority: '[a felügyeleti szerv neve és elérhetősége]',
    disputeResolution: '[az illetékes békéltető testület neve és elérhetősége]',
    noticePeriod: '[felmondási idő]',
    leadRetention: '[megkeresések őrzési ideje]',
    logRetention: '[naplók őrzési ideje]',
    effectiveDate: '[hatálybalépés dátuma]',
  },
};

function pick(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

/**
 * A cég- és kapcsolati adatok.
 *
 * Függvény, nem konstans: egy modulszintű objektum a build pillanatában
 * fagyasztaná be a környezeti változókat, és egy `.env` módosítás után is a régi
 * adatot szolgálná ki.
 */
export function getOrganization(): Organization {
  const env = fromEnv();

  return {
    contact: {
      email: pick(env.email, PLACEHOLDERS.contact.email),
      phone: pick(env.phone, PLACEHOLDERS.contact.phone),
      areaServed: pick(env.areaServed, PLACEHOLDERS.contact.areaServed),
      hours: pick(env.hours, PLACEHOLDERS.contact.hours),
      responseTime: pick(env.responseTime, PLACEHOLDERS.contact.responseTime),
    },
    company: {
      legalName: pick(env.legalName, PLACEHOLDERS.company.legalName),
      seat: pick(env.seat, PLACEHOLDERS.company.seat),
      taxNumber: pick(env.taxNumber, PLACEHOLDERS.company.taxNumber),
      registrationNumber: pick(env.registrationNumber, PLACEHOLDERS.company.registrationNumber),
      representative: pick(env.representative, PLACEHOLDERS.company.representative),
      bank: pick(env.bank, PLACEHOLDERS.company.bank),
      hostingProvider: pick(env.hostingProvider, PLACEHOLDERS.company.hostingProvider),
      supervisoryAuthority: pick(
        env.supervisoryAuthority,
        PLACEHOLDERS.company.supervisoryAuthority,
      ),
      disputeResolution: pick(env.disputeResolution, PLACEHOLDERS.company.disputeResolution),
      noticePeriod: pick(env.noticePeriod, PLACEHOLDERS.company.noticePeriod),
      leadRetention: pick(env.leadRetention, PLACEHOLDERS.company.leadRetention),
      logRetention: pick(env.logRetention, PLACEHOLDERS.company.logRetention),
      effectiveDate: pick(env.effectiveDate, PLACEHOLDERS.company.effectiveDate),
    },
  };
}

/**
 * Igaz, ha az adat még helyőrző — vagyis a `.env` megfelelő sora üres.
 *
 * A jogi oldalak ezzel tudnak figyelmeztetést mutatni ahelyett, hogy egy
 * `[adószám]` feliratot érvényes impresszumként tálalnának.
 */
export function isPlaceholder(value: string): boolean {
  return value.includes('[');
}

/** Igaz, ha bármelyik jogi adat hiányzik a `.env`-ből. */
export function hasIncompleteLegalData(organization: Organization): boolean {
  return [...Object.values(organization.company), organization.contact.email].some(isPlaceholder);
}

/* -------------------------------------------------------------------------- */
/* Származtatott értékek                                                       */
/* -------------------------------------------------------------------------- */

/**
 * `tel:` hivatkozás a telefonszámból.
 *
 * A szóközök és a kötőjelek kikerülnek, a vezető `+` viszont marad — enélkül
 * egy külföldről érkező hívás rossz körzetszámmal indulna. Ezért nem tároljuk
 * külön mezőben: egy elgépelt, kézzel karbantartott „hívható” változat
 * pontosan az a hiba, amit senki nem vesz észre hónapokig.
 */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

export function emailHref(email: string): string {
  return `mailto:${email}`;
}
