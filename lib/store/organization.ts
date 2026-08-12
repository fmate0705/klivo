/**
 * Cégadatok és elérhetőség — a kód *kívül* konfigurálható rétege.
 *
 * Ezek az értékek nem a forráskódban élnek, mert nem fejlesztői döntések: egy
 * telefonszám vagy egy adószám cseréjéhez nem lehet feltétele egy új deploy.
 * Két helyről állíthatók, ebben a sorrendben:
 *
 *   1. **Admin → Cégadatok.** A `data/settings.json`-ba mentve, azonnal él,
 *      újraindítás nélkül. Ez az elsődleges út.
 *   2. **Környezeti változó** (`.env`). Ez adja a kezdőértéket, amíg az adminban
 *      hozzá nem nyúlnak — így egy friss telepítés is helyes adatokkal indul,
 *      és a szerkesztetlen mezők automatikusan követik a `.env`-et. A `.env`
 *      átírása után a konténert újra kell indítani, és a változás legfeljebb öt
 *      percen belül jelenik meg az oldalon (az oldalak gyorsítótárának lejárata).
 *
 * Ha egyik sincs megadva, a `[szögletes zárójeles]` helyőrző marad — ez
 * szándékos: az azonnal látszik az oldalon, és nem lehet véletlenül élesíteni
 * kitalált cégadatokkal.
 *
 * A modul függőségmentes (semmi `node:fs`), ezért kliens komponens is
 * importálhat belőle értéket — az admin űrlap mezőlistája innen jön.
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
    effectiveDate: process.env.COMPANY_EFFECTIVE_DATE,
  };
}

/** Helyőrzők. Indulás előtt mind cserélendő — az oldalon is így látszanak. */
const PLACEHOLDERS: Organization = {
  contact: {
    email: 'hello@klivo.hu',
    phone: '+36 30 000 0000',
    areaServed: 'Magyarország',
    hours: 'Hétköznap 9:00 és 17:00 között',
    responseTime: 'Egy munkanapon belül válaszolunk.',
  },
  company: {
    legalName: 'Klivo [cégforma: Kft. / egyéni vállalkozó]',
    seat: '[irányítószám] [település], [utca, házszám]',
    taxNumber: '[adószám]',
    registrationNumber: '[cégjegyzékszám vagy nyilvántartási szám]',
    representative: '[képviselő neve]',
    bank: '[számlavezető bank és számlaszám]',
    hostingProvider: '[a tárhelyszolgáltató neve, székhelye és elérhetősége]',
    effectiveDate: '2026. augusztus 8.',
  },
};

/** A helyőrzők + a `.env` értékei. Ez a kiindulás, amit az admin felülír. */
export function defaultOrganization(): Organization {
  const env = fromEnv();
  const pick = <T extends string>(value: string | undefined, fallback: T): string =>
    value && value.trim().length > 0 ? value.trim() : fallback;

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
      effectiveDate: pick(env.effectiveDate, PLACEHOLDERS.company.effectiveDate),
    },
  };
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

/* -------------------------------------------------------------------------- */
/* Az admin űrlap mezői                                                        */
/* -------------------------------------------------------------------------- */

export type OrganizationField = {
  group: 'contact' | 'company';
  key: string;
  label: string;
  hint: string;
  /** Hosszabb szöveghez több soros mező kell. */
  multiline?: boolean;
};

export const CONTACT_FIELDS: OrganizationField[] = [
  {
    group: 'contact',
    key: 'email',
    label: 'E-mail cím',
    hint: 'A láblécben, a kapcsolat oldalon és a strukturált adatban is ez jelenik meg.',
  },
  {
    group: 'contact',
    key: 'phone',
    label: 'Telefonszám',
    hint: 'Ahogy ki szeretnéd írni. A hívható link automatikusan készül belőle.',
  },
  {
    group: 'contact',
    key: 'areaServed',
    label: 'Kiszolgált terület',
    hint: 'Például: Magyarország. A keresők ezt is felhasználják.',
  },
  {
    group: 'contact',
    key: 'hours',
    label: 'Ügyfélfogadás',
    hint: 'Például: Hétköznap 9:00 és 17:00 között.',
  },
  {
    group: 'contact',
    key: 'responseTime',
    label: 'Válaszidő ígéret',
    hint: 'A kapcsolat oldalon és a záró szekcióban jelenik meg.',
  },
];

export const COMPANY_FIELDS: OrganizationField[] = [
  {
    group: 'company',
    key: 'legalName',
    label: 'Cégnév (teljes, jogi név)',
    hint: 'Az impresszum és az ÁSZF első sora.',
  },
  { group: 'company', key: 'seat', label: 'Székhely', hint: 'Irányítószám, település, cím.' },
  { group: 'company', key: 'taxNumber', label: 'Adószám', hint: '' },
  {
    group: 'company',
    key: 'registrationNumber',
    label: 'Cégjegyzék- vagy nyilvántartási szám',
    hint: '',
  },
  { group: 'company', key: 'representative', label: 'Képviselő neve', hint: '' },
  {
    group: 'company',
    key: 'bank',
    label: 'Bankszámla',
    hint: 'Számlavezető bank és számlaszám. Az impresszumban jelenik meg.',
  },
  {
    group: 'company',
    key: 'hostingProvider',
    label: 'Tárhelyszolgáltató',
    hint: 'Név, székhely, elérhetőség. Az impresszumban kötelező adat.',
    multiline: true,
  },
  {
    group: 'company',
    key: 'effectiveDate',
    label: 'Jogi dokumentumok hatálybalépése',
    hint: 'Például: 2026. augusztus 8. Ez jelenik meg a jogi oldalak alján.',
  },
];

export const ORGANIZATION_FIELDS: OrganizationField[] = [...CONTACT_FIELDS, ...COMPANY_FIELDS];

/** Egy mező hossza. Az adószámtól a tárhelyszolgáltatóig minden belefér. */
export const ORGANIZATION_MAX_LENGTH = 300;
