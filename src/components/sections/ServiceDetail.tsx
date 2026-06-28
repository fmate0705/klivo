import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { services, primaryCta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import CtaBand from "@/components/sections/CtaBand";
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export default function ServiceDetail({ slug }: { slug: string }) {
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const serviceLd = serviceJsonLd(slug);
  const { pricing } = service;

  return (
    <>
      {serviceLd && <JsonLd data={serviceLd} />}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Főoldal", path: "/" },
          { name: service.title, path: `/${slug}` },
        ])}
      />

      <section className="subhero">
        <div className="subhero__aura" aria-hidden="true">
          <span className="wash" />
        </div>
        <div className="container">
          <nav className="breadcrumb" aria-label="Útvonal">
            <Link href="/">Főoldal</Link>
            <CaretRight size={14} />
            <span aria-current="page">{service.title}</span>
          </nav>
          <h1 className="subhero__title reveal">{service.title}</h1>
          <p className="subhero__lede reveal">{service.intro}</p>
          <div className="subhero__actions reveal">
            <Link href={primaryCta.href} className="btn btn--primary btn--lg">
              {primaryCta.label}
              <ArrowRight size={18} weight="bold" />
            </Link>
            <span className="badge">{service.priceLabel}</span>
          </div>
          {service.idealFor.length > 0 && (
            <div className="subhero__tags reveal">
              <span className="subhero__tags-label">Ideális:</span>
              {service.idealFor.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <h2 className="section-title">A szolgáltatás részletei</h2>
          </div>
          <div className="detail-grid">
            {service.detail.map((d, i) => (
              <article key={d.title} className="detail-card reveal" data-delay={i % 4}>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container container--narrow">
          <div className="section-head reveal">
            <h2 className="section-title">Minden projektben benne van</h2>
            {service.priceNote && (
              <p className="section-lede">{service.priceNote}</p>
            )}
          </div>
          <ul className="feature-list reveal">
            {service.features.map((f) => (
              <li key={f}>
                <Check size={20} weight="bold" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="arazas">
        <div className="container">
          <div className="section-head reveal">
            <h2 className="section-title">Árazás</h2>
            <p className="section-lede">{pricing.intro}</p>
          </div>

          {pricing.tiers && pricing.tiers.length > 0 && (
            <div className="tier-grid">
              {pricing.tiers.map((t, i) => (
                <article key={t.name} className="tier-card reveal" data-delay={i}>
                  <h3 className="tier-card__name">{t.name}</h3>
                  {t.note && <p className="tier-card__note">{t.note}</p>}
                  <p className="tier-card__price">{t.price}</p>
                  <ul className="tier-card__list">
                    {t.includes.map((x) => (
                      <li key={x}>
                        <Check size={16} weight="bold" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}

          <div className="pricing-aside reveal">
            <div className="pricing-factors">
              <h3>Mi befolyásolja az árat?</h3>
              <ul>
                {pricing.factors.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            {pricing.closing && (
              <p className="pricing-closing">{pricing.closing}</p>
            )}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
