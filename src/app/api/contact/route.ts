import { NextResponse } from "next/server";
import { contact } from "@/lib/site";

export const runtime = "nodejs";

/**
 * /api/contact — E-MAIL KÜLDÉS JELENLEG KIKAPCSOLVA.
 *
 * Az e-mailes (nodemailer/SMTP) kiküldést szándékosan kivezettük, hogy a
 * weboldal háttérszolgáltatás (Mailpit/SMTP) nélkül is stabilan fusson a
 * VPS-en, és semmi ne tudja "leállítani" a konténert emiatt.
 * Lásd: docs/decisions/0005-disable-email.md
 *
 * A kapcsolatfelvétel most közvetlen e-mail/telefon linkeken keresztül
 * történik (lásd src/components/sections/ContactInfo.tsx). Ez az endpoint
 * megőrizve, de csak egy egyértelmű "nincs beállítva" választ ad. Amikor
 * újra szeretnéd bekapcsolni az űrlapos küldést, állítsd vissza az alábbi,
 * kikommentelt implementációt, add vissza az SMTP_* változókat, és cseréld
 * a ContactInfo szekciót a ContactForm-ra.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: `Az online űrlapos küldés jelenleg nem elérhető. Írj közvetlenül: ${contact.email}`,
    },
    { status: 503 }
  );
}

/* ===========================================================================
 * MEGŐRZÖTT, EREDETI IMPLEMENTÁCIÓ (nodemailer/SMTP) — később visszakapcsolható.
 * Az újrahasználathoz állítsd vissza a lib/email.ts-t is, és állítsd be az
 * SMTP_* környezeti változókat (lásd .env.example, docker-compose.yml).
 * ---------------------------------------------------------------------------
 *
 * import { NextResponse } from "next/server";
 * import { validateContact } from "@/lib/validation";
 * import { sendContactEmail, isEmailConfigured } from "@/lib/email";
 * import { contact } from "@/lib/site";
 *
 * export const runtime = "nodejs";
 *
 * export async function POST(req: Request) {
 *   let body: unknown;
 *   try {
 *     body = await req.json();
 *   } catch {
 *     return NextResponse.json(
 *       { ok: false, error: "Érvénytelen kérés." },
 *       { status: 400 }
 *     );
 *   }
 *
 *   const input = (body ?? {}) as Record<string, unknown>;
 *
 *   // Honeypot: ha ki van töltve, valószínűleg bot. Csendben "sikert" jelzünk.
 *   if (typeof input.company === "string" && input.company.trim() !== "") {
 *     return NextResponse.json({ ok: true });
 *   }
 *
 *   const { ok, errors, data } = validateContact({
 *     name: typeof input.name === "string" ? input.name : "",
 *     email: typeof input.email === "string" ? input.email : "",
 *     phone: typeof input.phone === "string" ? input.phone : "",
 *     message: typeof input.message === "string" ? input.message : "",
 *   });
 *
 *   if (!ok) {
 *     return NextResponse.json(
 *       { ok: false, error: "Hibás vagy hiányzó mezők.", fields: errors },
 *       { status: 422 }
 *     );
 *   }
 *
 *   if (!isEmailConfigured()) {
 *     // Nincs SMTP beállítva: ne tegyünk úgy, mintha elküldtük volna az üzenetet.
 *     console.warn(
 *       "[contact] SMTP nincs beállítva, az üzenet nem lett kiküldve:",
 *       data.email
 *     );
 *     return NextResponse.json(
 *       {
 *         ok: false,
 *         error: `Az e-mail küldés jelenleg nincs beállítva. Írj közvetlenül: ${contact.email}`,
 *       },
 *       { status: 503 }
 *     );
 *   }
 *
 *   try {
 *     await sendContactEmail(data);
 *     return NextResponse.json({ ok: true });
 *   } catch (err) {
 *     console.error("[contact] e-mail küldési hiba:", err);
 *     return NextResponse.json(
 *       { ok: false, error: "Nem sikerült elküldeni az üzenetet." },
 *       { status: 502 }
 *     );
 *   }
 * }
 *
 * =========================================================================== */
