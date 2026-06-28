# 0004 — UX / akadálymentesség / biztonság javítások

**Kontextus:** felhasználói visszajelzés szerint a fejléc "Szolgáltatások"
többszintű menüje nehezen használható volt (eltűnt, amikor az egeret az
almenüre próbálták vinni). Emellett UI/UX átvizsgálás és a CLAUDE.md szerinti
ellenőrzés volt a feladat.

## Navigációs dropdown (a fő hiba)

**Probléma:** a dropdown csak hoverre nyílt, és a trigger meg a menü közötti
8px-es résben a `:hover` megszakadt, így a menü eltűnt. Csak hover (érintőn és
kattintással nem működött jól).

**Megoldás (ui-ux-pro-max `hover-vs-tap` szabály):**
- A trigger most `<button>` `aria-haspopup` és `aria-expanded` attribútumokkal.
- **Kattintásra/érintésre** nyílik (JS `data-open` állapot), nem csak hoverre.
- Egér esetén hover is nyitja (`onPointerEnter`/`Leave`, csak `pointerType==="mouse"`,
  hogy érintőn ne legyen szellem-hover).
- A rés-bug javítása: láthatatlan CSS "híd" (`.nav__menu::before`) a résben, így a
  hover nem szakad meg az átvitelkor.
- `Escape` és külső kattintás zárja; oldalváltáskor automatikusan zár.
- **A11y:** zárt állapotban `visibility: hidden`, így a zárt menü linkjei nem
  fókuszálhatók billentyűzettel (korábban igen, ami zavaró volt).

## Aktív oldal kiemelése

A navigációban a jelenlegi oldal most kiemelve jelenik meg (`.is-active` +
`aria-current="page"`), beleértve a szolgáltatás-aloldalakat is.

## Biztonsági fejlécek (.htaccess helyett)

A `.htaccess` Apache-specifikus, ez a projekt viszont **Next.js/Node** szerveren
fut Dockerben, ami nem olvas `.htaccess`-t. Ráadásul a Next.js csak a `public/`
mappát és a definiált route-okat szolgálja ki (a forrásfájlok, `.env` stb. eleve
nem érhetők el). A megfelelő megoldás biztonsági fejlécek a `next.config.ts`-ben:
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, valamint a `poweredByHeader` kikapcsolása.

## Tesztek (CLAUDE.md Tier 2 elvárás)

Bekerült a **Vitest**, és unit tesztek a `validateContact` üzleti logikára
(`src/lib/validation.test.ts`, 7 teszt). Futtatás: `npm test`.

## Egyéb

A gyökérből eltávolítottuk a régi, statikus Docker bind-mountokból visszamaradt
üres "fantom" mappákat (`robots.txt`, `sitemap.xml`, `llms.txt` stb.). A mostani
compose-ban nincs ilyen bind-mount, így nem keletkeznek újra.
