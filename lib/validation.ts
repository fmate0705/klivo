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
  photo: string;
  order: number;
};

export const TEAM_LIMITS = {
  name: 80,
  role: 80,
  bio: 400,
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
  const photo = text(data.photo);
  const order = Number(data.order);

  if (name.length < 2) errors.name = 'Kérjük, add meg a nevet.';
  else if (name.length > TEAM_LIMITS.name) errors.name = 'A név túl hosszú.';

  if (role.length < 2) errors.role = 'Kérjük, add meg a szerepet vagy pozíciót.';
  else if (role.length > TEAM_LIMITS.role) errors.role = 'A szerep túl hosszú.';

  if (bio.length > TEAM_LIMITS.bio) errors.bio = 'A bemutatkozás túl hosszú.';

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
