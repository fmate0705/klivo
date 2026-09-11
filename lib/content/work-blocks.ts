/**
 * A referencia oldalak építőelemei.
 *
 * Egy esettanulmány nem egyetlen szövegtömb: van benne felvezetés, kép,
 * eredményszám, ügyfélidézet. Ahhoz viszont, hogy ezt az admin össze tudja
 * rakni **kód nélkül**, kellett egy szótár: néhány **előre megtervezett
 * szekciósablon**, amiből a szerkesztő sorba rendezve felépíti az oldalt. Ez a
 * fájl az a szótár.
 *
 * **Miért nem szabad HTML.** Egy szabad HTML mező egyet jelentene azzal, hogy az
 * admin felület tárolt XSS-t tud írni a nyilvános oldalra, és azzal, hogy a
 * tipográfia oldalanként elcsúszik. Itt minden blokknak **rögzített szerkezete**
 * van, a megjelenítés a kódban él, és a szerkesztő csak a *tartalmat* adja meg.
 * A hosszabb szövegmezők a `lib/markdown.ts` szűk nyelvtanát használják, ami
 * előbb escapel, csak utána épít markupot.
 *
 * **Miért `lib/content/` alatt.** Ezt a szótárat a szerkesztő felület (kliens
 * komponens) és a megjelenítés (szerver komponens) is használja. Az adattárból
 * nem importálhat kliens kód — a tároló `revalidateTag`-et húz be, ami csak
 * szerveren létezik, és a build elszáll tőle.
 */

/** Egy eredménysor: a szám és az, hogy mit mér. */
export type WorkStat = { value: string; label: string };

/** Egy galériakép. */
export type WorkImage = { src: string; alt: string };

/**
 * Egy blokk.
 *
 * Az `id` nem az adat része, hanem a szerkesztésé: ez a React kulcs, és ez
 * azonosítja a blokkot húzás közben. Sorszám helyett azért kell, mert a
 * sorrend folyamatosan változik, és egy index-alapú kulcs átrendezéskor
 * összekeverné a mezők állapotát.
 */
export type WorkBlock =
  | { id: string; type: 'lead'; text: string }
  | { id: string; type: 'text'; title: string; body: string }
  | { id: string; type: 'image'; image: string; alt: string; caption: string }
  | {
      id: string;
      type: 'split';
      title: string;
      body: string;
      image: string;
      alt: string;
      flip: boolean;
    }
  | { id: string; type: 'stats'; title: string; items: WorkStat[] }
  | { id: string; type: 'quote'; text: string; author: string; role: string }
  | { id: string; type: 'list'; title: string; items: string[] }
  | { id: string; type: 'gallery'; images: WorkImage[] };

export type WorkBlockType = WorkBlock['type'];

/**
 * A sablonpaletta.
 *
 * A sorrend a gyakoriságot követi, nem az ábécét: ami a legtöbb
 * esettanulmányban szerepel, az van elöl. A `hint` nem díszítés — ez mondja
 * meg, mikor melyiket érdemes választani, és enélkül a szerkesztő mindig az
 * elsőt választaná.
 */
export const WORK_BLOCK_TEMPLATES: {
  type: WorkBlockType;
  label: string;
  hint: string;
}[] = [
  { type: 'lead', label: 'Felvezető', hint: 'Egy bekezdés nagy betűvel. A történet első mondata.' },
  { type: 'text', label: 'Szöveg', hint: 'Címsor és folyószöveg. A munka gerince.' },
  { type: 'split', label: 'Kép és szöveg', hint: 'Kép az egyik, szöveg a másik oldalon.' },
  { type: 'image', label: 'Kép', hint: 'Egy széles kép, alatta képaláírás.' },
  { type: 'stats', label: 'Eredmények', hint: 'Két-négy szám. A bizonyíték.' },
  { type: 'quote', label: 'Idézet', hint: 'Az ügyfél mondata, névvel.' },
  { type: 'list', label: 'Felsorolás', hint: 'Mit tartalmazott a munka.' },
  { type: 'gallery', label: 'Galéria', hint: 'Két-három kép egymás mellett.' },
];

/** Egy blokk emberi neve — a szerkesztő fejlécében és a hibaüzenetekben. */
export function blockLabel(type: WorkBlockType): string {
  return WORK_BLOCK_TEMPLATES.find((template) => template.type === type)?.label ?? type;
}

/**
 * Üres blokk a megadott típusból.
 *
 * Szándékosan **teljesen üres**, nem mintaszöveggel töltött. Egy előre kitöltött
 * blokkot könnyű ottfelejteni, és a nyilvános oldalon a „Lorem ipsum” sokkal
 * rosszabb, mint egy hiányzó szakasz.
 */
export function blankBlock(type: WorkBlockType, id: string): WorkBlock {
  switch (type) {
    case 'lead':
      return { id, type, text: '' };
    case 'text':
      return { id, type, title: '', body: '' };
    case 'image':
      return { id, type, image: '', alt: '', caption: '' };
    case 'split':
      return { id, type, title: '', body: '', image: '', alt: '', flip: false };
    case 'stats':
      return {
        id,
        type,
        title: '',
        items: [
          { value: '', label: '' },
          { value: '', label: '' },
        ],
      };
    case 'quote':
      return { id, type, text: '', author: '', role: '' };
    case 'list':
      return { id, type, title: '', items: ['', ''] };
    case 'gallery':
      return {
        id,
        type,
        images: [
          { src: '', alt: '' },
          { src: '', alt: '' },
        ],
      };
  }
}

/**
 * Hosszkorlátok blokkonként.
 *
 * Minden szerkeszthető mezőnek van felső korlátja. Egy korlát nélküli mező a
 * legegyszerűbb módja annak, hogy valaki teleírja az adatfájlt — és a
 * tipográfia is szétesik, ha egy „címsorba” három bekezdés kerül.
 */
export const WORK_BLOCK_LIMITS = {
  lead: 600,
  title: 140,
  body: 4000,
  alt: 160,
  caption: 200,
  image: 300,
  statValue: 24,
  statLabel: 80,
  quote: 600,
  author: 80,
  role: 100,
  listItem: 200,
} as const;

/** Legfeljebb ennyi blokk fér egy referenciába. */
export const MAX_WORK_BLOCKS = 40;
/** Legfeljebb ennyi elem egy eredmény-, felsorolás- vagy galériablokkban. */
export const MAX_BLOCK_ITEMS = 6;
