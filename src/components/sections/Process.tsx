import { processSteps } from "@/lib/site";

export default function Process() {
  return (
    <section className="section" id="folyamat">
      <div className="container">
        <div className="section-head reveal">
          <h2 className="section-title">
            Öt átlátható lépés az ötlettől az élő oldalig
          </h2>
          <p className="section-lede">
            Végig tudni fogod, hol tartunk és mi a következő lépés.
          </p>
        </div>

        <ol className="steps">
          {processSteps.map((s, i) => (
            <li key={s.title} className="step reveal" data-delay={i}>
              <span className="step__num" aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
