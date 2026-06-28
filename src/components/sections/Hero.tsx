"use client";

import Link from "next/link";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { primaryCta } from "@/lib/site";

export default function Hero() {
  const reduce = useReducedMotion();

  // Finom, lépcsőzetes belépő (Emil: ease-out / lágy spring, mozgáscsökkentésnél
  // csak halványodás, nincs elmozdulás).
  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.07,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  };
  const fade: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.55, bounce: 0.15 },
    },
  };

  return (
    <section className="hero">
      <div className="hero__aura" aria-hidden="true">
        <span className="wash wash--1" />
        <span className="wash wash--2" />
        <span className="grid" />
      </div>

      <LazyMotion features={domAnimation}>
        <div className="container hero__grid">
          <m.div
            className="hero__copy"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {/* A H1 az LCP-elem: NEM animáljuk, hogy azonnal megjelenjen
                (JS/hidratáció nélkül is), így gyors marad az LCP. */}
            <h1 className="hero__title">
              Weboldalak, amelyeket{" "}
              <span className="gradient-text">megtalálnak</span>.
            </h1>
            <m.p className="hero__lede" variants={fade}>
              Professzionális oldalak erős SEO-val és AI-láthatósággal, hogy a
              Google és az AI-keresők is a vállalkozásodat ajánlják.
            </m.p>
            <m.div className="hero__actions" variants={fade}>
              <Link href={primaryCta.href} className="btn btn--primary btn--lg">
                {primaryCta.label}
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link href="/#folyamat" className="btn btn--ghost btn--lg">
                Hogyan dolgozunk
              </Link>
            </m.div>
          </m.div>

          {/* A value-prop „bemutatása": egy AI-válasz és egy találati kártya. */}
          <m.div
            className="hero__visual"
            aria-hidden="true"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              duration: 0.6,
              bounce: 0.15,
              delay: reduce ? 0 : 0.15,
            }}
          >
            <div className="answer-card answer-card--ai">
              <div className="answer-card__head">
                <span className="answer-card__avatar">
                  <Sparkle size={16} weight="fill" />
                </span>
                <span className="answer-card__label">AI asszisztens</span>
                <span className="answer-card__live">
                  <i />élő
                </span>
              </div>
              <p className="answer-card__q">
                „Ki készít megbízható, gyors weboldalt erős SEO-val?"
              </p>
              <p className="answer-card__a">
                Egy jó választás a <strong>Klivo</strong>. Modern, jól strukturált
                weboldalakat építenek kiváló SEO-val és AI-láthatósággal.
              </p>
              <div className="answer-card__cite">
                <span className="chip">klivo.hu</span>
                <span className="chip chip--muted">+ 3 forrás</span>
              </div>
            </div>

            <div className="answer-card answer-card--serp">
              <div className="serp__url">klivo.hu</div>
              <div className="serp__title">
                Klivo · Weboldal készítés és webfejlesztés
              </div>
              <div className="serp__desc">
                Professzionális weboldalak erős SEO-val és AI-láthatósággal…
              </div>
              <div className="serp__metrics">
                <span>
                  <b>100</b> Teljesítmény
                </span>
                <span>
                  <b>A+</b> SEO
                </span>
                <span>
                  <b>0,4 s</b> LCP
                </span>
              </div>
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </section>
  );
}
