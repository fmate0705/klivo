/**
 * Kézzel írt validáció, séma-könyvtár nélkül.
 *
 * Miért nem zod: az egész alkalmazásban két űrlap van (kapcsolat, bejegyzés), és
 * mindkettőnek magyar nyelvű, mezőnkénti hibaüzenetet kell adnia. Egy séma
 * könyvtár ehhez saját hibafordítást és plusz futásidejű kódot hozna magával —
 * ennyi mezőnél az explicit ellenőrzés rövidebb és olvashatóbb.
 *
 * Két szabály fut végig mindenen:
 *
 * 1. **A kliensnek nem hiszünk.** Minden ellenőrzés a szerveren is lefut, akkor
 *    is, ha a böngészőben már megtörtént.
 * 2. **A hossz mindig felülről korlátos.** Egy hosszkorlát nélküli mező a
 *    legegyszerűbb módja annak, hogy valaki teleírja az adatfájlt.
 */

import {
  MAX_BLOCK_ITEMS,
  MAX_WORK_BLOCKS,
  WORK_BLOCK_LIMITS,
  ratioOf,
  type WorkBlock,
} from '@/lib/content/work-blocks';
import { DEFAULT_SETTINGS, WORKS_COUNT_RANGE, type SiteSettings } from '@/lib/content/settings';
import { SOCIAL_LIMITS, platformOf, type SocialPlatform } from '@/lib/content/social';
export type FieldErrors = Record<string, string>;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
/** Ékezet nélküli, kisbetűs, kötőjeles slug. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/* -------------------------------------------------------------------------- */
/* Kapcsolati űrlap                                                            */
/* -------------------------------------------------------------------------- */

export const CONTACT_TOPICS = [
  'Weboldal készítés',
  'Egyedi fejlesztés vagy AI',
  'Tárhely és üzemeltetés',
  'Meglévő oldal átvétele',
  'Egyéb',
] as const;

export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  topic: string;
  message: string;
};

export const CONTACT_LIMITS = {
  name: 80,
  email: 160,
  phone: 40,
  company: 120,
  message: 4000,
} as const;

export function validateContact(input: unknown): ValidationResult<ContactInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = text(data.name);
  const email = text(data.email);
  const phone = text(data.phone);
  const company = text(data.company);
  const topic = text(data.topic);
  const message = text(data.message);

  if (name.length < 2) errors.name = 'Kérjük, add meg a neved.';
  else if (name.length > CONTACT_LIMITS.name) errors.name = 'A név túl hosszú.';

  if (!email) errors.email = 'Kérjük, add meg az e-mail címed.';
  else if (!EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.email)
    errors.email = 'Ez az e-mail cím nem tűnik érvényesnek.';

  if (phone.length > CONTACT_LIMITS.phone) errors.phone = 'A telefonszám túl hosszú.';
  if (company.length > CONTACT_LIMITS.company) errors.company = 'A cégnév túl hosszú.';

  if (message.length < 10) errors.message = 'Írj pár mondatot arról, mire van szükséged.';
  else if (message.length > CONTACT_LIMITS.message) errors.message = 'Az üzenet túl hosszú.';

  const validTopic = (CONTACT_TOPICS as readonly string[]).includes(topic)
    ? topic
    : CONTACT_TOPICS[CONTACT_TOPICS.length - 1];

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { name, email, phone, company, topic: validTopic as string, message },
  };
}

/* -------------------------------------------------------------------------- */
/* Blogbejegyzés                                                               */
/* -------------------------------------------------------------------------- */

export type PostFormInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  imageAlt: string;
  author: string;
  published: boolean;
};

export const POST_LIMITS = {
  title: 120,
  slug: 120,
  excerpt: 320,
  category: 60,
  image: 300,
  imageAlt: 160,
  author: 80,
  body: 80_000,
} as const;

/**
 * Ékezetes magyar szövegből képez slugot.
 *
 * A `normalize('NFD')` szétbontja a betűt és az ékezetet, a `\p{Diacritic}`
 * csere pedig eldobja az ékezetet — így lesz az „árvíztűrő”-ből „arvizturo”,
 * ahelyett hogy az egész szó eltűnne, ahogy egy egyszerű `[^a-z0-9]` szűrővel
 * történne. Unicode property escape-et használunk literál kombináló karakterek
 * helyett: az utóbbi láthatatlan a diffben, és egy szerkesztő könnyen tönkreteszi.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, POST_LIMITS.slug);
}

export function validatePost(input: unknown): ValidationResult<PostFormInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const title = text(data.title);
  const rawSlug = text(data.slug);
  const excerpt = text(data.excerpt);
  const body = typeof data.body === 'string' ? data.body.trim() : '';
  const category = text(data.category) || 'Általános';
  const image = text(data.image);
  const imageAlt = text(data.imageAlt);
  const author = text(data.author) || 'Klivo';
  const published = data.published === true || data.published === 'true';

  if (title.length < 3) errors.title = 'A címnek legalább 3 karakternek kell lennie.';
  else if (title.length > POST_LIMITS.title) errors.title = 'A cím túl hosszú.';

  const slug = rawSlug ? slugify(rawSlug) : slugify(title);
  if (!slug || !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Az URL-részlet csak kisbetűt, számot és kötőjelet tartalmazhat.';
  }

  if (excerpt.length < 10) errors.excerpt = 'Írj egy rövid, egymondatos bevezetőt.';
  else if (excerpt.length > POST_LIMITS.excerpt) errors.excerpt = 'A bevezető túl hosszú.';

  if (body.length < 50) errors.body = 'A bejegyzés törzse túl rövid.';
  else if (body.length > POST_LIMITS.body) errors.body = 'A bejegyzés törzse túl hosszú.';

  if (category.length > POST_LIMITS.category) errors.category = 'A kategória neve túl hosszú.';
  if (author.length > POST_LIMITS.author) errors.author = 'A szerző neve túl hosszú.';
  if (imageAlt.length > POST_LIMITS.imageAlt) errors.imageAlt = 'A képleírás túl hosszú.';

  // A borítókép csak saját, oldalon belüli útvonal lehet. Külső URL egyrészt
  // követhetővé tenné a látogatót egy idegen szerveren, másrészt bármikor
  // eltűnhet a képünk alól.
  if (image) {
    if (image.length > POST_LIMITS.image || !image.startsWith('/') || image.startsWith('//')) {
      errors.image = 'A kép útvonala az oldalon belüli legyen, például /images/kep.webp.';
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { title, slug, excerpt, body, category, image, imageAlt, author, published },
  };
}

/* -------------------------------------------------------------------------- */
/* Csapattag                                                                   */
/* -------------------------------------------------------------------------- */

export type TeamFormInput = {
  name: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  photo: string;
  order: number;
};

export const TEAM_LIMITS = {
  name: 80,
  role: 80,
  bio: 400,
  email: 160,
  phone: 40,
  photo: 300,
} as const;

/**
 * Csapattag ellenőrzése.
 *
 * A név és a szerep kötelező: egy név nélküli kártya nem mond semmit, egy
 * szerep nélküli pedig nem magyarázza meg, ki az illető. A bemutatkozás és a
 * fotó elhagyható — előbbi nem mindenkiről születik, utóbbi helyett a
 * monogram áll be.
 */
export function validateTeamMember(input: unknown): ValidationResult<TeamFormInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = text(data.name);
  const role = text(data.role);
  const bio = text(data.bio);
  const email = text(data.email);
  const phone = text(data.phone);
  const photo = text(data.photo);
  const order = Number(data.order);

  if (name.length < 2) errors.name = 'Kérjük, add meg a nevet.';
  else if (name.length > TEAM_LIMITS.name) errors.name = 'A név túl hosszú.';

  if (role.length < 2) errors.role = 'Kérjük, add meg a szerepet vagy pozíciót.';
  else if (role.length > TEAM_LIMITS.role) errors.role = 'A szerep túl hosszú.';

  if (bio.length > TEAM_LIMITS.bio) errors.bio = 'A bemutatkozás túl hosszú.';

  // Mindkettő elhagyható — de ha meg van adva, legyen használható: egy elgépelt
  // cím a kártyán kattintható hivatkozásként jelenne meg, és sehova nem vinne.
  if (email && (!EMAIL_PATTERN.test(email) || email.length > TEAM_LIMITS.email)) {
    errors.email = 'Ez az e-mail cím nem tűnik érvényesnek.';
  }
  if (phone.length > TEAM_LIMITS.phone) errors.phone = 'A telefonszám túl hosszú.';

  if (photo && !photo.startsWith('/'))
    errors.photo = 'A kép útvonalának az oldalon belülre kell mutatnia.';
  else if (photo.length > TEAM_LIMITS.photo) errors.photo = 'A kép útvonala túl hosszú.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      role,
      bio,
      email,
      phone,
      photo,
      order: Number.isFinite(order) ? Math.trunc(order) : 0,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Gyakori kérdések                                                            */
/* -------------------------------------------------------------------------- */

export type FaqFormInput = {
  question: string;
  answer: string;
  pages: string[];
  order: number;
};

export const FAQ_LIMITS = { question: 160, answer: 1200 } as const;

/**
 * Egy gyakori kérdés ellenőrzése.
 *
 * A `pages` a megjelenési helyek kulcsainak listája; az ismeretlen kulcsokat
 * eldobjuk, nem hibázunk el rajtuk. Egy elgépelt kulcs úgyis csak annyit
 * jelentene, hogy a kérdés sehol nem jelenik meg — az érvényes kulcsokat
 * viszont kár lenne emiatt elveszíteni.
 */
export function validateFaqItem(
  input: unknown,
  allowedPages: readonly string[],
): ValidationResult<FaqFormInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const question = text(data.question);
  const answer = text(data.answer);
  const order = Number(data.order);
  const pages = Array.isArray(data.pages)
    ? data.pages.map((value) => text(value)).filter((value) => allowedPages.includes(value))
    : [];

  if (question.length < 5) errors.question = 'Kérjük, add meg a kérdést.';
  else if (question.length > FAQ_LIMITS.question) errors.question = 'A kérdés túl hosszú.';

  if (answer.length < 10) errors.answer = 'Kérjük, add meg a választ.';
  else if (answer.length > FAQ_LIMITS.answer) errors.answer = 'A válasz túl hosszú.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { question, answer, pages, order: Number.isFinite(order) ? order : 0 },
  };
}

/* -------------------------------------------------------------------------- */
/* Referencia (esettanulmány)                                                  */
/* -------------------------------------------------------------------------- */

export type WorkFormInput = {
  client: string;
  title: string;
  slug: string;
  excerpt: string;
  industry: string;
  year: string;
  services: string[];
  siteUrl: string;
  logo: string;
  cover: string;
  coverAlt: string;
  blocks: WorkBlock[];
  order: number;
  published: boolean;
};

export const WORK_LIMITS = {
  client: 80,
  title: 140,
  slug: 120,
  excerpt: 320,
  industry: 60,
  year: 20,
  service: 60,
  services: 8,
  siteUrl: 300,
  media: 300,
  coverAlt: 160,
} as const;

/**
 * Oldalon belüli médiaútvonal.
 *
 * Külső URL egyrészt követhetővé tenné a látogatót egy idegen szerveren,
 * másrészt bármikor eltűnhet a képünk alól. A `//` kezdet azért külön eset,
 * mert az protokoll-relatív **külső** cím, miközben `/`-rel kezdődik.
 */
function isLocalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

/** Egy referenciablokk ellenőrzése. Ismeretlen típusra `undefined`. */
function cleanBlock(input: unknown, index: number): WorkBlock | undefined {
  const data = (input ?? {}) as Record<string, unknown>;
  const id = text(data.id).slice(0, 40) || `blokk-${index}`;
  const limits = WORK_BLOCK_LIMITS;

  /** Egy médiamező: csak oldalon belüli útvonal maradhat meg. */
  const media = (value: unknown): string => {
    const path = text(value).slice(0, limits.image);
    return isLocalPath(path) ? path : '';
  };

  const list = (value: unknown, limit: number): string[] =>
    Array.isArray(value)
      ? value
          .map((item) => text(item).slice(0, limit))
          .filter(Boolean)
          .slice(0, MAX_BLOCK_ITEMS)
      : [];

  switch (text(data.type)) {
    case 'lead':
      return { id, type: 'lead', text: text(data.text).slice(0, limits.lead) };

    case 'text':
      return {
        id,
        type: 'text',
        title: text(data.title).slice(0, limits.title),
        body: text(data.body).slice(0, limits.body),
      };

    case 'image':
      return {
        id,
        type: 'image',
        image: media(data.image),
        alt: text(data.alt).slice(0, limits.alt),
        caption: text(data.caption).slice(0, limits.caption),
      };

    case 'split':
      return {
        id,
        type: 'split',
        title: text(data.title).slice(0, limits.title),
        body: text(data.body).slice(0, limits.body),
        image: media(data.image),
        alt: text(data.alt).slice(0, limits.alt),
        flip: data.flip === true || data.flip === 'true',
        // Ismeretlen képarányra az alapértelmezés áll be — a szerkesztő nem
        // tud olyat küldeni, amire a megjelenítésnek nincs osztálya.
        ratio: ratioOf(text(data.ratio)).value,
      };

    case 'stats':
      return {
        id,
        type: 'stats',
        title: text(data.title).slice(0, limits.title),
        items: (Array.isArray(data.items) ? data.items : [])
          .map((item) => {
            const row = (item ?? {}) as Record<string, unknown>;
            return {
              value: text(row.value).slice(0, limits.statValue),
              label: text(row.label).slice(0, limits.statLabel),
            };
          })
          .filter((item) => item.value || item.label)
          .slice(0, MAX_BLOCK_ITEMS),
      };

    case 'quote':
      return {
        id,
        type: 'quote',
        text: text(data.text).slice(0, limits.quote),
        author: text(data.author).slice(0, limits.author),
        role: text(data.role).slice(0, limits.role),
      };

    case 'list':
      return {
        id,
        type: 'list',
        title: text(data.title).slice(0, limits.title),
        items: list(data.items, limits.listItem),
      };

    case 'gallery':
      return {
        id,
        type: 'gallery',
        images: (Array.isArray(data.images) ? data.images : [])
          .map((item) => {
            const row = (item ?? {}) as Record<string, unknown>;
            return { src: media(row.src), alt: text(row.alt).slice(0, limits.alt) };
          })
          .filter((image) => image.src)
          .slice(0, MAX_BLOCK_ITEMS),
      };

    default:
      return undefined;
  }
}

/**
 * Egy referencia ellenőrzése.
 *
 * **A blokkokra nem hibaüzenet jár, hanem vágás.** Egy félig kitöltött blokk
 * nem hiba: a szerkesztő épp dolgozik rajta, és egy piros üzenet a huszadik
 * blokknál csak akadály lenne. Ami viszont nem mehet át: az ismeretlen típus (a
 * megjelenítés nem tudna vele mit kezdeni) és a külső médiaútvonal — mindkettőt
 * némán eldobjuk. A megjelenítés az üres blokkokat úgyis kihagyja.
 */
export function validateWork(input: unknown): ValidationResult<WorkFormInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const client = text(data.client);
  const title = text(data.title);
  const rawSlug = text(data.slug);
  const excerpt = text(data.excerpt);
  const industry = text(data.industry);
  const year = text(data.year);
  const siteUrl = text(data.siteUrl);
  const logo = text(data.logo);
  const cover = text(data.cover);
  const coverAlt = text(data.coverAlt);
  const order = Number(data.order);
  const published = data.published === true || data.published === 'true';

  const services = Array.isArray(data.services)
    ? data.services
        .map((item) => text(item).slice(0, WORK_LIMITS.service))
        .filter(Boolean)
        .slice(0, WORK_LIMITS.services)
    : [];

  const blocks = (Array.isArray(data.blocks) ? data.blocks : [])
    .slice(0, MAX_WORK_BLOCKS)
    .map((block, index) => cleanBlock(block, index))
    .filter((block): block is WorkBlock => block !== undefined);

  if (client.length < 2) errors.client = 'Kérjük, add meg az ügyfél nevét.';
  else if (client.length > WORK_LIMITS.client) errors.client = 'Az ügyfél neve túl hosszú.';

  if (title.length < 3) errors.title = 'A címnek legalább 3 karakternek kell lennie.';
  else if (title.length > WORK_LIMITS.title) errors.title = 'A cím túl hosszú.';

  const slug = rawSlug ? slugify(rawSlug) : slugify(`${client} ${title}`);
  if (!slug || !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Az URL-részlet csak kisbetűt, számot és kötőjelet tartalmazhat.';
  }

  if (excerpt.length < 10) errors.excerpt = 'Írj egy rövid, egymondatos összefoglalót.';
  else if (excerpt.length > WORK_LIMITS.excerpt) errors.excerpt = 'Az összefoglaló túl hosszú.';

  if (industry.length > WORK_LIMITS.industry) errors.industry = 'Az ágazat neve túl hosszú.';
  if (year.length > WORK_LIMITS.year) errors.year = 'Az évszám túl hosszú.';
  if (coverAlt.length > WORK_LIMITS.coverAlt) errors.coverAlt = 'A képleírás túl hosszú.';

  // Az élő oldal az egyetlen mező, ami kifelé mutathat — ott viszont csak
  // `https`. Egy `javascript:` cím ugyanúgy „link”, csak épp kódot futtat.
  if (siteUrl) {
    if (siteUrl.length > WORK_LIMITS.siteUrl || !/^https?:\/\/[^\s]+$/i.test(siteUrl)) {
      errors.siteUrl = 'Az oldal címe teljes cím legyen, például https://pelda.hu.';
    }
  }

  if (logo && (!isLocalPath(logo) || logo.length > WORK_LIMITS.media)) {
    errors.logo = 'A logó útvonalának az oldalon belülre kell mutatnia.';
  }

  if (cover && (!isLocalPath(cover) || cover.length > WORK_LIMITS.media)) {
    errors.cover = 'A borító útvonalának az oldalon belülre kell mutatnia.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      client,
      title,
      slug,
      excerpt,
      industry,
      year,
      services,
      siteUrl,
      logo,
      cover,
      coverAlt,
      blocks,
      order: Number.isFinite(order) ? Math.trunc(order) : 0,
      published,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Partner embléma                                                             */
/* -------------------------------------------------------------------------- */

export type PartnerFormInput = {
  name: string;
  logo: string;
  url: string;
  order: number;
};

export const PARTNER_LIMITS = { name: 80, logo: 300, url: 300 } as const;

/**
 * Egy partner ellenőrzése.
 *
 * A név **kötelező**, és nem udvariasságból: ez lesz a logó alternatív szövege.
 * Név nélkül a sáv képernyőolvasóval néma képek sorozata lenne. Az embléma is
 * kötelező — az egész sáv az emblémákról szól.
 */
export function validatePartner(input: unknown): ValidationResult<PartnerFormInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = text(data.name);
  const logo = text(data.logo);
  const url = text(data.url);
  const order = Number(data.order);

  if (name.length < 2) errors.name = 'Kérjük, add meg a cég nevét.';
  else if (name.length > PARTNER_LIMITS.name) errors.name = 'A cégnév túl hosszú.';

  if (!logo) errors.logo = 'Tölts fel egy emblémát.';
  else if (!isLocalPath(logo) || logo.length > PARTNER_LIMITS.logo) {
    errors.logo = 'Az embléma útvonalának az oldalon belülre kell mutatnia.';
  }

  if (url) {
    if (url.length > PARTNER_LIMITS.url || !/^https?:\/\/[^\s]+$/i.test(url)) {
      errors.url = 'Az oldal címe teljes cím legyen, például https://pelda.hu.';
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { name, logo, url, order: Number.isFinite(order) ? Math.trunc(order) : 0 },
  };
}

/* -------------------------------------------------------------------------- */
/* Megjelenési beállítások                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A megjelenési kapcsolók ellenőrzése.
 *
 * Itt nincs hibaüzenet: minden mező **beszorítható** értelmes tartományba, és
 * egy kapcsolóhoz nem tartozik értelmes hibaszöveg. Ismeretlen azonosító
 * egyszerűen kiesik — a megjelenítés úgyis csak a létező, publikált
 * referenciákat veszi figyelembe.
 */
export function cleanSettings(input: unknown): SiteSettings {
  const data = (input ?? {}) as Record<string, unknown>;
  const partners = (data.partners ?? {}) as Record<string, unknown>;
  const works = (data.works ?? {}) as Record<string, unknown>;

  const count = Number(works.count);
  const clamped = Number.isFinite(count)
    ? Math.min(WORKS_COUNT_RANGE.max, Math.max(WORKS_COUNT_RANGE.min, Math.trunc(count)))
    : DEFAULT_SETTINGS.works.count;

  return {
    partners: { enabled: partners.enabled !== false },
    works: {
      enabled: works.enabled !== false,
      count: clamped,
      ids: Array.isArray(works.ids)
        ? [...new Set(works.ids.map((id) => text(id).slice(0, 40)).filter(Boolean))].slice(
            0,
            WORKS_COUNT_RANGE.max,
          )
        : [],
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Közösségi média hivatkozás                                                  */
/* -------------------------------------------------------------------------- */

export type SocialFormInput = {
  platform: SocialPlatform;
  url: string;
  order: number;
};

/**
 * Egy közösségi hivatkozás ellenőrzése.
 *
 * **A felület zárt listából jön**, nem szabad szövegből: ismeretlen értékre a
 * megjelenítésnek nem lenne jele, és egy elgépelt platformnév néma hibát adna.
 *
 * **Csak `https`.** A közösségi profilok mind azon vannak, és egy `http`
 * hivatkozás a böngészőben vegyes tartalomként viselkedne. A `javascript:`
 * séma ugyanígy kiesik — az is „link”, csak épp kódot futtat.
 */
export function validateSocialLink(input: unknown): ValidationResult<SocialFormInput> {
  const data = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const platform = platformOf(text(data.platform));
  const url = text(data.url);
  const order = Number(data.order);

  if (!platform) errors.platform = 'Válassz felületet a listából.';

  if (!url) errors.url = 'Add meg a profil címét.';
  else if (url.length > SOCIAL_LIMITS.url || !/^https:\/\/[^\s]+\.[^\s]+$/i.test(url)) {
    errors.url = 'A cím teljes, https-sel kezdődő webcím legyen.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      platform: (platform as NonNullable<typeof platform>).value,
      url,
      order: Number.isFinite(order) ? Math.trunc(order) : 0,
    },
  };
}
