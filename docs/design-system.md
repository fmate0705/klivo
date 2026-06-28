# Design-rendszer

Világos, Apple-szerű prémium light theme: sok negatív tér, finom árnyékok, nagy
lekerekítések, egy markáns indigó akcentus. Minden érték a
[`src/styles/tokens.css`](../src/styles/tokens.css)-ben él.

## Tipográfia

- **Geist** (`next/font/sans` és `/mono`), rendszer-fontstack fallbackkel.
  (A Geist a Vercel betűtípusa, jól illik a Next.js-hez; nem a szokásos „Inter
  default".) Fluid skála `clamp()`-pal, display fejlécek 650 súllyal, feszes
  betűközzel, `text-wrap: balance`.

## Szín

| Token | Érték | Használat |
|---|---|---|
| `--bg` / `--bg-elevated` / `--bg-alt` | `#FBFBFD` / `#FFF` / `#F4F5F9` | Felületek |
| `--ink` / `--ink-soft` / `--ink-muted` | `#0E0F14` / `#3A3D49` / `#6B6F7D` | Szöveg |
| `--accent` / `--accent-strong` | `#3B5BFF` / `#2E47E0` | Egyetlen akcentus, CTA, link |
| `--accent-2` | `#7C4DFF` | Csak a márkajelben és a hero-washban / gradiens-szóban |

Egy akcentus az egész oldalon (color consistency lock). A violet csak a
logó-gradiensben és a hero háttérben jelenik meg, nem második CTA-szín.

## Ikonok

**Phosphor** (`@phosphor-icons/react/dist/ssr`), egységes család, szerver-
komponensekben is. Nincs kézzel rajzolt SVG ikon (kivéve a logó-jel, ami egy
egyszerű geometrikus mark).

## Komponens-nyelv

- **Gombok** `.btn`: `--primary` (akcentus + glow), `--ghost`, `--light`,
  `--lg`, `--block`. Hover: 2px emelés, ikon-csúszás. `touch-action: manipulation`.
- **Kártyák:** `.pricing-card` (+`--feature`), `.bento__cell` (+`cell-feature`
  sötét), `.step`, `.faq__item`, `.detail-card`, `.answer-card`. Közös nyelv:
  hajszálvékony keret + lágy árnyék + hover-emelés.
- **Bento (Miért mi?):** változó cellaméretek (2 széles + 1 teljes szélességű
  sötét AI-SEO kiemelés + 3 kisebb), nem 6 egyforma kártya.

## Signature elem

A hero jobb oldalán egymásra rétegzett, finoman lebegő **AI-válasz** és
**találati (SERP)** kártya: vizuálisan bemutatja az AI-láthatóság ígéretét.
Háttér: visszafogott aurora-wash + halvány rács (nem neon „AI-glow").

## Mozgás

- Scroll-reveal IntersectionObserverrel (`.reveal`), a tartalom JS nélkül is
  látható. Lépcsőzetes késleltetés `[data-delay]`-jel.
- Mikrointerakciók: gomb/kártya hover, link-nyíl csúszás, FAQ „+→×",
  finom hero-kártya lebegés.
- `prefers-reduced-motion` mindent kikapcsol.

## A `taste` skill alapján végzett finomítások

Em-dash kivezetése, eyebrow-ok ritkítása (max 1 / 3 szekció), 2 soros hero
címsor, trust-strip a hero alá, egységes „Kérj ajánlatot" CTA (egy intent egy
felirat), Geist + Phosphor, ritmusos bento.
