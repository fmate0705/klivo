import { faqs } from "@/lib/site";

export default function Faq() {
  return (
    <section className="section section--alt" id="gyik">
      <div className="container container--narrow">
        <div className="section-head reveal">
          <h2 className="section-title">Gyakori kérdések</h2>
        </div>

        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q} className="faq__item reveal">
              <summary>{f.q}</summary>
              <div className="faq__body">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
