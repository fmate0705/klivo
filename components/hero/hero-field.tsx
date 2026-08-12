import { SectionArt, GlowSpot } from '@/components/ui/section-art';

/**
 * A hero mögötti világos fényfelület.
 *
 * Nincs benne álbrowser, képernyőkép vagy termékfotó: egy ügynökség, amely
 * egyedi munkát ad el, nem nyithat egy általános weboldal képével. Ehelyett maga
 * a *felület* dolgozik — egy halvány színfátyol felül, finom rács, két lassan
 * lélegző fénykorong, és alul egy áramló vonalgrafika, amely a szemet a lap
 * aljára, az első szekció felé vezeti.
 *
 * Minden réteg világos: az oldal végig fehér marad, nincs sötét-világos váltás.
 * A mozgás költségvetése szigorú — kizárólag `transform` és `opacity`, azaz
 * minden a kompozitoron fut, és `prefers-reduced-motion` esetén megáll.
 */
export function HeroField() {
  return (
    <div
      aria-hidden="true"
      data-decorative
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Színfátyol felül: ez adja a mélységet a címsor mögött. */}
      {/* A színfátyol az egyetlen kép, amit `cover`-rel nyújtunk: nincs rajta
          felismerhető tárgy, amit a vágás elronthatna. */}
      <SectionArt
        src="/images/bg-aurora.webp"
        position="top"
        fit="cover"
        opacity={0.5}
        priority
        className="mask-fade-b"
      />

      {/* Finom rács. Alul elhalványul, hogy a szöveg alatt ne zavarjon. */}
      <div className="bg-grid mask-fade-b absolute inset-0 opacity-60 [--grid-size:76px]" />

      {/* Két lassan lélegző fénykorong, ellentétes ütemben. */}
      <GlowSpot className="animate-float-slow -left-24 top-[-6rem]" size="34rem" />
      <GlowSpot className="animate-drift -right-32 top-[10%]" color="accent" size="30rem" />

      {/* A kurzort követő fény. A `--x` / `--y` értékeket a Hero írja,
          képkockánként legfeljebb egyszer. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(34rem 26rem at var(--x, 50%) var(--y, 34%), rgb(var(--primary-rgb) / 0.10), transparent 70%)',
        }}
      />

      {/*
       * A hero mögé szándékosan NEM kerül vonalgrafika.
       *
       * A rendelkezésre álló áramló grafikák sötét sávot is tartalmaznak, ami a
       * címsor mögé csúszva rontja a szöveg kontrasztját — és egy nyitóképernyőn
       * az olvashatóság mindig előbbre való, mint egy díszítés. A grafikák ezért
       * ott dolgoznak, ahol a szöveg saját, fehér kártyán ül (szolgáltatások,
       * záró CTA), a hero pedig tiszta tipográfia marad lágy fényen.
       */}

      {/* Lágy átmenet a következő szekcióba. */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
