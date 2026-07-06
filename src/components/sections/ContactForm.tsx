// MEGŐRZÖTT KOMPONENS — jelenleg NINCS használatban.
// Az e-mailt küldő kapcsolati űrlap egyelőre ki van kapcsolva; helyette a
// /kapcsolat oldal a háttérszolgáltatás nélküli ContactInfo szekciót használja
// (lásd docs/decisions/0005-disable-email.md). Ezt a fájlt szándékosan
// megtartottuk, hogy az űrlapos küldés később egyszerűen visszakapcsolható
// legyen (állítsd vissza az /api/contact route-ot és a lib/email.ts-t is).
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import { contact } from "@/lib/site";
import { validateContact, type FieldErrors } from "@/lib/validation";

type Status = { type: "idle" | "ok" | "error"; message?: string };

export default function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
      company: String(fd.get("company") || ""), // honeypot
    };

    const result = validateContact(input);
    setErrors(result.errors);
    if (!result.ok) {
      const firstError = Object.keys(result.errors)[0];
      if (firstError) {
        form.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      }
      setStatus({ type: "error", message: "Kérlek, javítsd a jelölt mezőket." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "send_failed");
      form.reset();
      setStatus({
        type: "ok",
        message:
          "Köszönjük! Megkaptuk az üzeneted, 24 órán belül válaszolunk.",
      });
    } catch {
      setStatus({
        type: "error",
        message: `Hiba történt a küldés során. Kérlek, próbáld újra, vagy írj a ${contact.email} címre.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact__grid">
      <div className="contact__intro reveal">
        <h2 className="section-title">Kérj ingyenes ajánlatot</h2>
        <p className="section-lede">
          Írd meg pár sorban, mire van szükséged. Visszajelzünk 24 órán belül, és
          összerakunk egy átlátható ajánlatot.
        </p>
        <ul className="contact__info">
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <Phone size={18} />
            </span>
            <span>
              <span className="info-item__label">Telefon</span>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </span>
          </li>
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <EnvelopeSimple size={18} />
            </span>
            <span>
              <span className="info-item__label">E-mail</span>
              <a href={contact.emailHref}>{contact.email}</a>
            </span>
          </li>
          <li className="info-item">
            <span className="icon-chip icon-chip--sm">
              <MapPin size={18} />
            </span>
            <span>
              <span className="info-item__label">Hol</span>
              <strong>{contact.areaServed}</strong>, online az egész országban
            </span>
          </li>
        </ul>
      </div>

      <form className="form reveal" onSubmit={onSubmit} noValidate>
        <div className="field" data-error={Boolean(errors.name)}>
          <label htmlFor="name">Név</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Pl. Kovács Anna"
            required
          />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </div>

        <div className="field-row">
          <div className="field" data-error={Boolean(errors.email)}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="anna@pelda.hu"
              required
            />
            {errors.email && (
              <span className="field__error">{errors.email}</span>
            )}
          </div>
          <div className="field" data-error={Boolean(errors.phone)}>
            <label htmlFor="phone">Telefon (nem kötelező)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+36 30 123 4567"
            />
            {errors.phone && (
              <span className="field__error">{errors.phone}</span>
            )}
          </div>
        </div>

        <div className="field" data-error={Boolean(errors.message)}>
          <label htmlFor="message">Üzenet</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Néhány mondat arról, mire van szükséged…"
            required
          />
          {errors.message && (
            <span className="field__error">{errors.message}</span>
          )}
        </div>

        {/* Honeypot a botok ellen: embernek üresen kell maradnia. */}
        <div className="form__hp" aria-hidden="true">
          <label htmlFor="company">Cég (hagyd üresen)</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          className="btn btn--primary btn--block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Küldés…" : "Ajánlatkérés elküldése"}
        </button>

        <p className="form__note">
          Az adataidat bizalmasan kezeljük, lásd az{" "}
          <Link href="/adatkezelesi-tajekoztato">Adatkezelési tájékoztatót</Link>.
        </p>

        {status.type !== "idle" && (
          <p
            className={`form__status ${status.type === "ok" ? "is-ok" : "is-error"}`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
