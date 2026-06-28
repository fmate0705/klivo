# 0005 — Animáció, teljesítmény és SEO polírozás

A `framer-motion`, `emil-design-eng` és `nextjs-seo` skillek alapján.

## Animációk (Motion + Emil)

- **Framer-motion (Motion)** a hero belépőjéhez: lépcsőzetes, lágy spring
  (`LazyMotion` + `m` a kisebb bundle-ért). A támogató elemek (lede, gombok,
  vizuál) finoman beúsznak.
- **Az LCP-elem (H1) szándékosan NEM animált** (lásd Teljesítmény). A többi
  szekció scroll-reveal-je **CSS marad**, mert Emil szerint a CSS-animáció a
  fő szálon kívül fut és terhelés alatt is sima (ez egyben a leggyorsabb és
  SEO-barát megoldás, hiszen a tartalom JS nélkül is látható).
- **Emil-finomítások:** gomb `:active` `scale(0.97)` (gyorsabb visszajelzés),
  reveal időzítés 620→540ms, távolság 18→16px, rövidebb stagger (50–200ms),
  erős egyedi easing.
- **Hozzáférhetőség:** `useReducedMotion` (mozgáscsökkentésnél csak halványodás)
  és `<noscript>` fallback, hogy a hero JS nélkül is látható maradjon.

## Teljesítmény

- A hero **H1 (LCP-elem) statikus**, így SSR-ből azonnal megjelenik, nem vár a
  hidratációra. Mért hatás (Chrome trace, lokál): **LCP 770ms → 181ms**,
  **CLS 0.00**.
- `experimental.optimizePackageImports` az ikonkönyvtárhoz; Motion `LazyMotion`-nel.
- Az oldal egyébként is statikus (SSG), kép nélkül (inline SVG), Geist `next/font`-tal.

## SEO (nextjs-seo + kutatás)

- **Generált PNG OG-kép** (`app/opengraph-image.tsx`, `twitter-image.tsx`) a
  `next/og` ImageResponse-szal, Geist betűvel (a magyar ékezetek, pl. „ő",
  helyesen jelennek meg). A korábbi SVG OG helyett, mert a közösségi platformok
  a PNG-t megbízhatóan jelenítik meg. Build időben, statikusan generálva.
- **Metaadat:** `keywords` a kulcsszókutatás alapján (beépítve a
  „honlapkészítés"/„honlap" szinonimák, amelyek nagy keresési volumenűek),
  `creator`/`publisher`, `googleBot` direktívák (`max-image-preview: large` stb.).
- **robots:** `Disallow: /api/` (az API-végpont ne legyen indexelve).
- **Strukturált adat:** `PostalAddress` (addressCountry: HU) az Organization-höz.
- A `description`-ökbe természetesen bekerült a „honlapkészítés" kifejezés.

## Kulcsszókutatás (összegzés)

A magyar piacon a „weboldal készítés" és a „honlapkészítés" is magas volumenű;
a belépő ár jellemzően 150 000 Ft felett indul, így a Klivo „100 000 Ft-tól"
ára versenyelőny. A jellemző óradíj 10 000–25 000 Ft/óra (ezért maradt a
konkrét óradíj a megrendelővel egyeztetendő).
