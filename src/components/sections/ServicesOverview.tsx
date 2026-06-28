import Link from "next/link";
import { Browsers, Code, HardDrives, Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { services } from "@/lib/site";

const icons: Record<string, Icon> = {
  "weboldal-keszites": Browsers,
  "egyedi-fejlesztes": Code,
  tarhely: HardDrives,
};

export default function ServicesOverview() {
  return (
    <section className="section" id="szolgaltatasok">
      <div className="container">
        <div className="section-head reveal">
          <h2 className="section-title">
            Minden, amire egy erős online jelenléthez szükség van
          </h2>
          <p className="section-lede">
            A weboldal megépítésétől a folyamatos üzemeltetésig, egy helyen,
            átlátható árazással.
          </p>
        </div>

        <div className="pricing-grid">
          {services.map((s, i) => {
            const IconCmp = icons[s.slug] ?? Browsers;
            const feature = i === 0;
            return (
              <article
                key={s.slug}
                className={`pricing-card${feature ? " pricing-card--feature" : ""} reveal`}
                data-delay={i}
              >
                <div className="pricing-card__top">
                  <span className="icon-chip">
                    <IconCmp size={22} />
                  </span>
                  {feature && <span className="badge">Legnépszerűbb</span>}
                </div>
                <h3 className="pricing-card__title">{s.title}</h3>
                <p className="pricing-card__price">
                  <b>{s.priceLabel}</b>
                </p>
                <p className="pricing-card__summary">{s.summary}</p>
                <ul className="pricing-card__list">
                  {s.features.map((f) => (
                    <li key={f}>
                      <Check size={18} weight="bold" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/${s.slug}`} className="link-arrow">
                  Részletek
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
