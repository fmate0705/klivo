/**
 * E-mail küldés (nodemailer/SMTP) — JELENLEG KIKAPCSOLVA.
 *
 * A teljes implementáció szándékosan ki van kommentelve, hogy a weboldal
 * SMTP/Mailpit háttérszolgáltatás nélkül is fusson, és semmi ne tudja
 * "leállítani" a konténert emiatt (lásd docs/decisions/0005-disable-email.md).
 *
 * Jelenleg semmi sem importálja ezt a modult (az /api/contact route stubbá lett
 * alakítva, a kapcsolati oldal pedig közvetlen e-mail/telefon linkeket használ).
 *
 * VISSZAKAPCSOLÁS:
 *   1. Vedd ki a kommentből az alábbi implementációt.
 *   2. Állítsd vissza az /api/contact route eredeti (megőrzött) változatát.
 *   3. Cseréld a ContactInfo szekciót a ContactForm-ra a /kapcsolat oldalon.
 *   4. Add meg az SMTP_* / MAIL_* környezeti változókat (.env, docker-compose.yml).
 */

export {}; // A fájl így is érvényes ES-modul marad, üres export mellett.

/* ===========================================================================
 * MEGŐRZÖTT, EREDETI IMPLEMENTÁCIÓ — később visszakapcsolható.
 * ---------------------------------------------------------------------------
 *
 * import "server-only";
 * import nodemailer from "nodemailer";
 * import type { ContactInput } from "@/lib/validation";
 *
 * const {
 *   SMTP_HOST,
 *   SMTP_PORT,
 *   SMTP_USER,
 *   SMTP_PASS,
 *   SMTP_SECURE,
 *   MAIL_FROM,
 *   MAIL_TO,
 * } = process.env;
 *
 * export function isEmailConfigured(): boolean {
 *   return Boolean(SMTP_HOST);
 * }
 *
 * function createTransport() {
 *   if (!SMTP_HOST) {
 *     throw new Error(
 *       "Hiányzó SMTP konfiguráció (SMTP_HOST). Állítsd be a környezeti változókat."
 *     );
 *   }
 *   return nodemailer.createTransport({
 *     host: SMTP_HOST,
 *     port: Number(SMTP_PORT ?? 587),
 *     secure: SMTP_SECURE === "true",
 *     auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
 *   });
 * }
 *
 * function escapeHtml(value: string): string {
 *   return value
 *     .replace(/&/g, "&amp;")
 *     .replace(/</g, "&lt;")
 *     .replace(/>/g, "&gt;")
 *     .replace(/"/g, "&quot;");
 * }
 *
 * export async function sendContactEmail(data: ContactInput): Promise<void> {
 *   const transporter = createTransport();
 *
 *   const from = MAIL_FROM ?? "Klivo weboldal <no-reply@klivo.hu>";
 *   const to = MAIL_TO ?? "hello@klivo.hu";
 *
 *   const lines = [
 *     `Név: ${data.name}`,
 *     `E-mail: ${data.email}`,
 *     `Telefon: ${data.phone || "(nincs megadva)"}`,
 *     "",
 *     "Üzenet:",
 *     data.message,
 *   ];
 *
 *   await transporter.sendMail({
 *     from,
 *     to,
 *     replyTo: `${data.name} <${data.email}>`,
 *     subject: `Új ajánlatkérés a weboldalról: ${data.name}`,
 *     text: lines.join("\n"),
 *     html: `
 *       <div style="font-family:system-ui,sans-serif;font-size:15px;color:#0E0F14">
 *         <h2 style="margin:0 0 12px">Új ajánlatkérés</h2>
 *         <p><strong>Név:</strong> ${escapeHtml(data.name)}</p>
 *         <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
 *         <p><strong>Telefon:</strong> ${escapeHtml(data.phone || "(nincs megadva)")}</p>
 *         <p style="margin-top:16px"><strong>Üzenet:</strong></p>
 *         <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
 *       </div>
 *     `,
 *   });
 * }
 *
 * =========================================================================== */
