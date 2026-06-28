# 0001 — Stack és tier választás

**Döntés:** Tier 1 (statikus marketing one-page), build nélküli stack
(szemantikus HTML5 + modern CSS + vanilla JS), nginx-en Dockerizálva.

**Kontextus:** Egy induló webügynökség bemutatkozó oldala. Nincs auth, nincs
adatbázis, nincs felhasználói fiók. A kapcsolati űrlap külső végpontra köthető.

**Mérlegelt alternatívák:**

1. **Next.js + Tailwind + Docker** (a konstitúció elsődleges példája).
   *Mellette:* modern showcase-stack, natív Metadata API, könnyű aloldalak.
   *Ellene:* futásidejű/építési függőségek, nehezebb „klónozd és fut"
   megbízhatóság, és egy egyszerű marketing-oldalhoz felesleges súly. A
   Tailwind/Next verzió-specifikus build-konfiguráció kockázatot is hoz.

2. **Statikus HTML/CSS/JS + nginx** ✅ (választott).
   *Mellette:* leggyorsabb betöltés és legjobb Core Web Vitals — épp az
   ügynökség saját USP-je; nulla futásidejű függőség → maximálisan megbízható
   `docker compose up`; egyszerűen bővíthető aloldalakkal; a SEO/JSON-LD
   teljes baseline kézzel is tisztán megvalósítható. *Ellene:* nincs beépített
   komponens-újrafelhasználás keretrendszerből, és blog/CMS-hez (Tier 2) később
   portolás kellhet.

**Miért nyert a 2.:** Az ügynökség saját oldala a legjobb portfólió. Egy
villámgyors, közel 100-as Lighthouse-pontszámú statikus oldal hitelesebben
demonstrálja a „gyors, jól strukturált, SEO/AI-barát weboldal" ígéretet, mint
egy nehezebb keretrendszeres megoldás. A megbízható, függőségmentes futás és a
prémium design így is maradéktalanul teljesíthető.

**Következmény:** Ha később blog/CMS vagy szerveroldali e-mail kell, Tier 2-re
lépünk (pl. statikus generátor vagy Next.js), megtartva a jelen design-rendszert.
