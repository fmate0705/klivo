# 0003 — Tier 2 átállás: Next.js + e-mail backend, multi-page

> **Megjegyzés:** e döntés e-mail-backend része részben **felülírva** —
> az e-mail küldés jelenleg kikapcsolva, lásd
> [0005-disable-email.md](0005-disable-email.md). A Tier 2 stack egyébként
> változatlan.

**Döntés:** A korábbi statikus (Tier 1) oldalt **Next.js (App Router) +
TypeScript** alapú **Tier 2** alkalmazássá alakítottuk, valódi e-mail
backenddel, többoldalas szerkezettel és jogi oldalakkal. A design nyelvet
(light theme, indigó akcentus, kártyák, AI-válasz hero) megtartottuk és
finomítottuk.

**Kontextus / kiváltó ok:** a megrendelő e-mail kezelő backendet, jogi
oldalakat (Impresszum, Adatkezelési, ÁSZF), többoldalas szerkezetet és
copy/design finomítást kért. A backend miatt a projekt Tier 1-ből Tier 2-be
lép (a konstitúció szerint Tier 2 = dinamikus oldal e-mail küldéssel +
mail-catcher a helyi fejlesztéshez).

**Mérlegelt alternatívák:**

1. **Statikus oldal + különálló kis Node API az e-mailhez.** Megtartaná a
   korábbi statikus frontendet, de a multi-page (közös fejléc/lábléc, per-oldal
   SEO) DRY-sága és a backend integráció nehézkesebb; több mozgó alkatrész
   (nginx + node + build-tool).
2. **Next.js (App Router) — választott.** Egy koherens alkalmazásban oldja meg
   a multi-page-et (közös layout), a per-oldal Metadata API-t, a JSON-LD-t és az
   `/api/contact` backendet. A konstitúció Tier 2 elsődleges stackje. Dockerben
   (standalone) fut, így megfelel a "weboldal Dockerben fusson" kikötésnek.

**Miért nyert a Next.js:** a backend + multi-page + per-oldal SEO együtt a
keretrendszerrel sokkal karbantarthatóbb, és pontosan a CLAUDE.md Tier 2
mintáját követi (App Router, `lib/email.ts`, `api/contact/route.ts`, Mailpit a
compose-ban). A megrendelő tetszését elnyert design 1:1 átültethető volt a
meglévő CSS design-rendszer újrahasznosításával.

**Backend:** `app/api/contact/route.ts` (POST) validál (honeypot + szerveroldali
ellenőrzés), majd `lib/email.ts` SMTP-n (nodemailer) küld. Helyi fejlesztés:
Mailpit (compose), web UI a :8025 porton. Élesben a valós SMTP a környezeti
változókban.

**Design/copy finomítás (`taste` skill):** redesign-preserve módban. Kivezettük
az em-dash-eket, ritkítottuk az eyebrow-okat (max 1 / 3 szekció), rövidítettük a
hero címsort (max 2 sor), a trust-stripet a hero alá tettük, a "Miért mi?"
szekciót ritmusos bento-ra cseréltük (nem 6 egyforma kártya), Geist + Phosphor
ikonok, és egységesítettük a fő CTA feliratot ("Kérj ajánlatot").

**Következmény:** ha később CMS/blog kell, a Next.js alap természetesen
bővíthető. A statikus stack döntés (0001) ezzel felülírva.
