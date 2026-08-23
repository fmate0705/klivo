import type { TeamMember } from '@/lib/store/team';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/container';
import { Section, type SectionBand, type SectionTone } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/heading';
import { Reveal } from '@/components/motion/reveal';
import { SmartImage } from '@/components/ui/smart-image';
import { WaveLayer } from '@/components/wave/wave-layer';
import { WaveRule } from '@/components/wave/wave-rule';

/**
 * Ismerd meg a csapatot.
 *
 * A tagokat az admin szerkeszti (`/admin/csapat`), tehát egy új kolléga
 * felvétele nem forráskód-módosítás. Ha nincs egyetlen tag sem, a szekció
 * **nem jelenik meg**: egy üres „csapat” rovat rosszabb, mint a hiánya.
 *
 * **Nem kártyarács, hanem váltakozó bemutatkozó sorok.** Ide a vezetők
 * kerülnek, néhányan — négy egyforma kártya ebből névsort csinálna. Egymás
 * alatt, felváltva jobbra-balra viszont mindegyikre jut egy teljes sor: a
 * portré nagy, a bemutatkozás mellette olvasható, és a szem cikcakkban halad
 * lefelé.
 *
 * **A portré hasábja fix szélességű**, nem a tartalomhoz igazodik. Egy `1fr`
 * oszlop a hosszabb bemutatkozás mellett összenyomná a képet, és a két tag
 * portréja más méretű lenne — a váltakozásból így rendetlenség lenne, nem
 * ritmus.
 *
 * **A szöveg mindig a saját portréja mellett áll.** A hasáb szélesebb, mint a
 * szöveg, ezért a jobbra fordított soroknál a szövegblokk a hasáb jobb
 * széléhez tolódik. Enélkül a név a lap túlsó szélére került, a fölötte lévő
 * sor szövege alá — és nem lehetett eldönteni, melyik képhez tartozik.
 *
 * **A portrék átlátszó hátterűek lesznek.** Ezért kap mindegyik alá egy
 * hullámokból rakott, kék felületet — a kivágott alak így nem lyukként hat,
 * hanem mintha vízből emelkedne ki. Fotó híján a névből képzett monogram áll
 * be ugyanezen a felületen.
 */
export function Team({
  members,
  tone = 'white',
  band,
}: {
  members: TeamMember[];
  tone?: SectionTone;
  band?: SectionBand;
}) {
  if (members.length === 0) return null;

  return (
    <Section band={band} tone={tone}>
      <Container>
        <SectionHeading
          title="Ismerd meg a csapatot"
          lead="Kis csapat, közvetlen kapcsolat. Nálunk nem ügyfélmenedzseren keresztül üzensz a fejlesztőnek — azzal beszélsz, aki dolgozik az oldaladon."
          className="max-w-3xl"
        />

        <ul className="mt-16 flex flex-col gap-16 lg:mt-20 lg:gap-24">
          {members.map((member, index) => {
            const flipped = index % 2 === 1;
            return (
              <li
                key={member.id}
                // Fix oszlopszélesség, nem `1fr` — és **a rács fordul meg**, nem
                // csak a sorrend. Ha csak a sorrendet cserélnénk, a portré a
                // széles hasábba kerülne, és a két tag képe más méretű lenne.
                className={cn(
                  'grid items-center gap-8 sm:gap-12 lg:gap-16',
                  flipped
                    ? 'sm:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_20rem]'
                    : 'sm:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]',
                )}
              >
                <Reveal
                  variant={flipped ? 'right' : 'left'}
                  className={cn('min-w-0', flipped && 'sm:order-2')}
                >
                  <TeamPortrait member={member} index={index} />
                </Reveal>

                <Reveal
                  variant={flipped ? 'left' : 'right'}
                  delay={80}
                  className={cn(
                    'min-w-0 max-w-xl',
                    flipped && 'sm:order-1 sm:ml-auto sm:text-right',
                  )}
                >
                  <p className="text-body-sm font-semibold uppercase tracking-[0.08em] text-wave-9">
                    {member.role}
                  </p>
                  <h3 className="mt-2 text-h3">{member.name}</h3>
                  <WaveRule tone="soft" className={cn('mt-5 max-w-xs', flipped && 'ml-auto')} />
                  {member.bio ? (
                    <p className={cn('text-soft mt-5 text-body', flipped && 'sm:ml-auto')}>
                      {member.bio}
                    </p>
                  ) : null}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/**
 * A portré felülete.
 *
 * Három hullámréteg a kék skálából, a tag sorszámától függő tónusokkal — a
 * sor nem lesz egyhangú, de ugyanaz a tag mindig ugyanúgy néz ki.
 */
const BACKDROPS = [
  ['wave-3', 'wave-5', 'wave-7'],
  ['wave-4', 'wave-6', 'wave-8'],
  ['wave-2', 'wave-4', 'wave-6'],
  ['wave-5', 'wave-7', 'wave-9'],
];

function TeamPortrait({ member, index }: { member: TeamMember; index: number }) {
  const tones = BACKDROPS[index % BACKDROPS.length] as string[];

  return (
    <div className="border-soft relative aspect-[4/5] w-full overflow-hidden rounded-panel border bg-wave-2 shadow-raise">
      <span aria-hidden="true" className="wave-stack">
        {[
          { top: 0.38, crests: 1, amplitude: 0.34, phase: 0.2, duration: '52s', drift: '3%' },
          { top: 0.6, crests: 1.5, amplitude: 0.26, phase: 0.7, duration: '66s', drift: '-4%' },
          { top: 0.82, crests: 2, amplitude: 0.2, phase: 0.35, duration: '58s', drift: '5%' },
        ].map((layer, layerIndex) => (
          <WaveLayer
            key={layerIndex}
            tone={tones[layerIndex] as string}
            top={layer.top}
            crest="clamp(26px, 5vw, 52px)"
            crests={layer.crests}
            amplitude={layer.amplitude}
            phase={layer.phase}
            line={0.6}
            drift={layer.drift}
            duration={layer.duration}
            delay={`-${layerIndex * 11}s`}
            zIndex={layerIndex}
          />
        ))}
      </span>

      {member.photo ? (
        <SmartImage
          src={member.photo}
          alt={`${member.name} — ${member.role}`}
          width={800}
          height={1000}
          sizes="(min-width: 1024px) 20rem, (min-width: 640px) 15rem, 100vw"
          className="wave-content h-full"
          imageClassName="h-full object-cover object-bottom"
        />
      ) : (
        <span aria-hidden="true" className="wave-content flex h-full items-center justify-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-pill bg-blue font-display text-h3 font-semibold text-on-dark shadow-raise">
            {initials(member.name)}
          </span>
        </span>
      )}
    </div>
  );
}

/** Monogram a névből — legfeljebb két betű. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
