import "server-only";
import nodemailer from "nodemailer";
import type { ContactInput } from "@/lib/validation";

/**
 * E-mail küldés SMTP-n keresztül (nodemailer).
 *
 * Helyi fejlesztésben a docker-compose elindít egy Mailpit szolgáltatást
 * (SMTP a 1025 porton, webes postafiók a http://localhost:8025 címen), így
 * minden e-mail biztonságosan ott landol valódi kiküldés nélkül.
 *
 * Élesben állítsd be a valós SMTP adatokat a környezeti változókban
 * (lásd .env.example). Ha nincs SMTP_HOST beállítva, a küldés szándékosan
 * hibát dob, hogy ne tűnjön sikeresnek egy elveszett üzenet.
 */

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM,
  MAIL_TO,
} = process.env;

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_HOST);
}

function createTransport() {
  if (!SMTP_HOST) {
    throw new Error(
      "Hiányzó SMTP konfiguráció (SMTP_HOST). Állítsd be a környezeti változókat."
    );
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: SMTP_SECURE === "true",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactEmail(data: ContactInput): Promise<void> {
  const transporter = createTransport();

  const from = MAIL_FROM ?? "Klivo weboldal <no-reply@klivo.hu>";
  const to = MAIL_TO ?? "hello@klivo.hu";

  const lines = [
    `Név: ${data.name}`,
    `E-mail: ${data.email}`,
    `Telefon: ${data.phone || "(nincs megadva)"}`,
    "",
    "Üzenet:",
    data.message,
  ];

  await transporter.sendMail({
    from,
    to,
    replyTo: `${data.name} <${data.email}>`,
    subject: `Új ajánlatkérés a weboldalról: ${data.name}`,
    text: lines.join("\n"),
    html: `
      <div style="font-family:system-ui,sans-serif;font-size:15px;color:#0E0F14">
        <h2 style="margin:0 0 12px">Új ajánlatkérés</h2>
        <p><strong>Név:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(data.phone || "(nincs megadva)")}</p>
        <p style="margin-top:16px"><strong>Üzenet:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
      </div>
    `,
  });
}
