import {
  MagnifyingGlass,
  Sparkle,
  Lightning,
  ShieldCheck,
  Clock,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";

export default function WhyUs() {
  return (
    <section className="section section--alt" id="miert-mi">
      <div className="container">
        <div className="section-head reveal">
          <h2 className="section-title">Nem csak szép. Megtalálható és gyors is.</h2>
          <p className="section-lede">
            Egy weboldal akkor ér valamit, ha az ügyfeleid és az őket segítő
            keresők is rátalálnak. Mi erre építünk.
          </p>
        </div>

        <div className="bento">
          <article className="bento__cell cell-a reveal">
            <span className="icon-chip">
              <MagnifyingGlass size={22} />
            </span>
            <h3>Kiváló SEO</h3>
            <p>
              Tiszta szerkezet, gyors betöltés és átgondolt tartalom, hogy a
              Google előrébb sorolja az oldalad.
            </p>
          </article>

          <article className="bento__cell cell-b reveal" data-delay="1">
            <span className="icon-chip">
              <Lightning size={22} />
            </span>
            <h3>Villámgyors betöltés</h3>
            <p>
              Optimalizált, könnyű oldalak kiváló Core Web Vitals értékekkel. A
              sebesség konverziót és helyezést is hoz.
            </p>
          </article>

          <article className="bento__cell cell-feature reveal">
            <div>
              <span className="icon-chip">
                <Sparkle size={22} weight="fill" />
              </span>
              <h3>AI SEO, vagyis AI-láthatóság</h3>
              <p>
                Strukturált adatokkal és gépek számára is érthető tartalommal a
                ChatGPT, a Gemini és a Perplexity is a céged ajánlja.
              </p>
            </div>
            <div className="cell-feature__viz" aria-hidden="true">
              <div className="ai-pills">
                <span>ChatGPT</span>
                <span>Gemini</span>
                <span>Perplexity</span>
              </div>
            </div>
          </article>

          <article className="bento__cell cell-c reveal">
            <span className="icon-chip">
              <ShieldCheck size={22} />
            </span>
            <h3>Megbízható technológia</h3>
            <p>
              Modern, biztonságos és karbantartható alapok, hogy az oldalad évek
              múlva is stabilan működjön.
            </p>
          </article>

          <article className="bento__cell cell-d reveal" data-delay="1">
            <span className="icon-chip">
              <Clock size={22} />
            </span>
            <h3>Gyors fejlesztés</h3>
            <p>
              Feszes folyamat és tiszta kommunikáció, hogy az oldalad hetek, ne
              hónapok alatt élesedjen.
            </p>
          </article>

          <article className="bento__cell cell-e reveal" data-delay="2">
            <span className="icon-chip">
              <Receipt size={22} />
            </span>
            <h3>Átlátható árazás</h3>
            <p>
              Fix ajánlat, meglepetések nélkül. Pontosan tudod, miért mennyit
              fizetsz, már az indulás előtt.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
