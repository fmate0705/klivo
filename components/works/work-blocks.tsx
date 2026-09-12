import { ratioOf, type WorkBlock } from '@/lib/content/work-blocks';
import { renderMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { SmartImage } from '@/components/ui/smart-image';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * A referencia oldalak törzse.
 *
 * A szerkesztő sablonblokkokból rakja össze az oldalt (`lib/content/work-blocks.ts`);
 * ez a modul rajzolja ki őket. **A megjelenítés itt van, nem az adatban**: a
 * szerkesztő a tartalmat adja meg, a tipográfiát a rendszer — így nem tud
 * oldalanként elcsúszni, és nincs szabad HTML, amin tárolt XSS érkezhetne.
 *
 * A hosszabb szövegmezők a `lib/markdown.ts` szűk nyelvtanát használják. A
 * renderer előbb escapel, csak utána épít markupot, tehát az adminból beírt
 * szöveg soha nem válhat futtatható HTML-lé — ezért adható át
 * `dangerouslySetInnerHTML`-lel.
 *
 * **Az üres blokkok kimaradnak.** A szerkesztő közben dolgozik, és egy félig
 * kitöltött blokk a mentés pillanatában nem hiba — a nyilvános oldalon viszont
 * egy üres szakasz az lenne. A vágás itt történik, nem a validációban: ott a
 * szerkesztő elveszítené a megkezdett munkáját.
 */

/** A folyószöveg mértéke. Ugyanaz, mint a blogbejegyzéseké. */
const PROSE = 'max-w-[62rem]';

export function WorkBlocks({ blocks }: { blocks: WorkBlock[] }) {
  const visible = blocks.filter(hasContent);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-14 lg:gap-20">
      {visible.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}

/** Igaz, ha a blokknak van megjeleníthető tartalma. */
function hasContent(block: WorkBlock): boolean {
  switch (block.type) {
    case 'lead':
      return Boolean(block.text);
    case 'text':
      return Boolean(block.title || block.body);
    case 'image':
      return Boolean(block.image);
    case 'split':
      return Boolean(block.title || block.body || block.image);
    case 'stats':
      return block.items.some((item) => item.value || item.label);
    case 'quote':
      return Boolean(block.text);
    case 'list':
      return block.items.length > 0;
    case 'gallery':
      return block.images.length > 0;
  }
}

function BlockView({ block }: { block: WorkBlock }) {
  switch (block.type) {
    case 'lead':
      return (
        <Container>
          <Reveal as="p" className={cn('text-ink-soft text-body-lg font-medium', PROSE)}>
            {block.text}
          </Reveal>
        </Container>
      );

    case 'text':
      return (
        <Container>
          <div className={PROSE}>
            {block.title ? (
              <Reveal as="h2" className="text-h3">
                {block.title}
              </Reveal>
            ) : null}
            {block.body ? (
              <Reveal delay={block.title ? 60 : 0} className={cn(block.title && 'mt-6')}>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(block.body) }}
                />
              </Reveal>
            ) : null}
          </div>
        </Container>
      );

    case 'image':
      return (
        <Container width="wide">
          <Reveal variant="figure" as="figure">
            <SmartImage
              src={block.image}
              alt={block.alt}
              width={1600}
              height={900}
              sizes="(min-width: 1440px) 1360px, 100vw"
              className="border-soft rounded-panel border bg-wave-2"
            />
            {block.caption ? (
              <figcaption className="text-soft mt-4 text-body-sm">{block.caption}</figcaption>
            ) : null}
          </Reveal>
        </Container>
      );

    case 'split': {
      // A képarányt a szerkesztő választja; ebből következik a kép doboza **és**
      // a hasábok osztása is. Régebbi, képarány nélkül mentett blokknál az
      // alapértelmezés áll be — lásd `ratioOf`.
      const ratio = ratioOf(block.ratio);

      return (
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
            <Reveal
              variant="figure"
              className={cn(ratio.image, block.flip ? 'lg:order-2' : 'lg:order-1')}
            >
              {block.image ? (
                <SmartImage
                  src={block.image}
                  alt={block.alt}
                  width={1200}
                  height={900}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  // A doboz aránya kötött, a kép pedig **belevágódik**
                  // (`object-cover`). Enélkül egy álló fotó mellett a bekezdés
                  // egy vékony csíkká préselődne a sor közepén.
                  className={cn('border-soft rounded-panel border bg-wave-2', ratio.aspect)}
                  imageClassName="h-full object-cover"
                />
              ) : null}
            </Reveal>

            <div
              className={cn(ratio.text, block.flip ? 'lg:order-1 lg:row-start-1' : 'lg:order-2')}
            >
              <Reveal delay={80}>
                {block.title ? <h2 className="text-h3">{block.title}</h2> : null}
                {block.title && block.body ? <WaveRule className="mt-5" /> : null}
                {block.body ? (
                  <div
                    className={cn('prose', (block.title || block.image) && 'mt-5')}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(block.body) }}
                  />
                ) : null}
              </Reveal>
            </div>
          </div>
        </Container>
      );
    }

    case 'stats':
      return (
        <Container>
          {block.title ? (
            <Reveal as="h2" className="text-h3">
              {block.title}
            </Reveal>
          ) : null}

          {/* A számok nem kártyában ülnek: egy eredmény akkor üt, ha nagy és
              nincs körülötte keret. A hullámvonal viszi az elválasztást. */}
          <ul className={cn('grid gap-8 sm:grid-cols-2 lg:grid-cols-4', block.title && 'mt-10')}>
            {block.items.map((item, index) => (
              <Reveal as="li" key={index} delay={staggerDelay(index, 60)}>
                <p data-numeric className="font-display text-h2">
                  {item.value}
                </p>
                <WaveRule className="mt-4 max-w-[8rem]" />
                <p className="text-soft mt-4 text-body-sm">{item.label}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      );

    case 'quote':
      return (
        <Container>
          <Reveal as="figure" className={PROSE}>
            <blockquote className="font-display text-h3 font-medium">
              <p>„{block.text}”</p>
            </blockquote>
            {block.author ? (
              <figcaption className="text-soft mt-6 text-body-sm">
                <span className="font-semibold">{block.author}</span>
                {block.role ? <span> — {block.role}</span> : null}
              </figcaption>
            ) : null}
          </Reveal>
        </Container>
      );

    case 'list':
      return (
        <Container>
          <div className={PROSE}>
            {block.title ? (
              <Reveal as="h2" className="text-h3">
                {block.title}
              </Reveal>
            ) : null}
            <ul
              className={cn(
                'divide-soft grid divide-y sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0',
                block.title && 'mt-8',
              )}
            >
              {block.items.map((item, index) => (
                <Reveal
                  as="li"
                  key={index}
                  delay={staggerDelay(index, 50)}
                  className="border-soft flex gap-3 py-4 sm:border-b"
                >
                  <Dot />
                  <span className="text-body">{item}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      );

    case 'gallery':
      return (
        <Container width="wide">
          <ul
            className={cn(
              'grid gap-5',
              block.images.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
            )}
          >
            {block.images.map((image, index) => (
              <Reveal
                as="li"
                key={index}
                variant="figure"
                delay={staggerDelay(index, 60)}
                className="min-w-0"
              >
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  width={900}
                  height={675}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                  className="border-soft rounded-panel border bg-wave-2"
                />
              </Reveal>
            ))}
          </ul>
        </Container>
      );
  }
}

/** Felsoroláspont. A jelentést a szöveg hordozza, ez csak a ritmus. */
function Dot() {
  return (
    <span aria-hidden="true" className="mt-[0.6em] block h-1 w-1 shrink-0 rounded-pill bg-wave-6" />
  );
}
