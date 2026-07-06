# 0005 — E-mail küldés kivezetése (átmenetileg kikapcsolva)

**Dátum:** 2026-07-06

**Kontextus:** a weboldal VPS-en, Dockerben fut. A kapcsolati űrlap eddig
SMTP-n (nodemailer) küldött e-mailt, helyi fejlesztésben a `docker-compose`
által indított **Mailpit** szolgáltatáson keresztül. A VPS-en az e-mail/Mailpit
rész problémát okozott (a második szolgáltatás és a `depends_on` miatt a
konténer indítása/üzeme megakadt). A cél: a weboldal **e-mail háttérszolgáltatás
nélkül is** stabilan fusson, egyetlen konténerben, extra hálózat nélkül — az
e-mailes funkciót viszont **ne töröljük**, csak kommentáljuk ki, hogy később
egyszerűen visszakapcsolható legyen.

## Döntés

Az űrlapos, SMTP-s e-mail küldést átmenetileg **kikapcsoltuk** (nem töröltük):

- **Kapcsolati oldal** (`/kapcsolat`): az e-mailt küldő `ContactForm` helyett egy
  új, háttérszolgáltatás nélküli **`ContactInfo`** szekció (közvetlen `mailto:` /
  `tel:` linkek, elérhetőségek). Ez később szabadon szerkeszthető.
  Az eredeti `ContactForm.tsx` megőrizve (nincs importálva).
- **`/api/contact` route**: a nodemailer-es implementáció kikommentelve (a
  fájlban megőrizve), a `POST` most egyértelmű `503`-at ad vissza a közvetlen
  e-mail címmel. Így az endpoint nem importálja a `lib/email.ts`-t, és a
  nodemailer nem kerül be a szerver bundle-be.
- **`lib/email.ts`**: a teljes nodemailer/SMTP implementáció kikommentelve
  (megőrizve), a modul üres `export {}`-tal érvényes marad. Senki nem importálja.
- **`package.json`**: a `nodemailer` és `@types/nodemailer` **bennmarad**
  (szándékosan nem távolítottuk el), hogy a visszakapcsolás egyszerű legyen és a
  lockfile ne csússzon el.

## Docker / hálózat

- **Mailpit szolgáltatás eltávolítva** a `docker-compose.yml`-ből (kikommentelve),
  a `web` `depends_on` blokkjával együtt — ez volt a VPS-es fennakadás fő oka.
- A `web` szolgáltatásra **`network_mode: bridge`** került: a Compose így **nem
  hoz létre külön projekt-hálózatot** (`klivo_default`), a konténer a Docker
  beépített alap `bridge` hálózatát használja. A `3000:3000` portpublikálás
  változatlanul működik. (Ellenőrizve: `docker compose config` → nincs `networks:`
  szekció, egyetlen `web` szolgáltatás.)
- `restart: unless-stopped` megmarad; nincs több olyan függőség, ami leállíthatná.
- Az SMTP_* / MAIL_* környezeti változók kikommentelve a `docker-compose.yml`-ben
  és a `.env.example`-ben.

## Alternatívák

- **Teljes törlés:** elvetve — a felhasználó kifejezetten kérte, hogy csak
  kommentáljuk ki, ne töröljük.
- **Külső űrlapszolgáltató** (pl. Formspree) vagy **API-alapú e-mail** (Resend
  stb.): jó jövőbeli út, mert nem kell saját SMTP/konténer. Most nem vezettük be;
  a `ContactInfo` közvetlen linkjei elégségesek, és a régi backend készen áll.

## Visszakapcsolás (röviden)

1. `lib/email.ts` és `app/api/contact/route.ts`: kommentből vissza az eredeti kód.
2. `/kapcsolat`: `ContactInfo` → `ContactForm`.
3. SMTP_* / MAIL_* változók megadása (`.env`, `docker-compose.yml`), vagy API-alapú
   szolgáltatóra váltás.

> Ez a döntés részben felülírja a
> [`0003-tier2-nextjs-email.md`](0003-tier2-nextjs-email.md) e-mail-backend
> részét (a Tier 2 stack egyébként változatlan).
