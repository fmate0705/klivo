/**
 * Kapcsolati űrlap validáció. Ugyanezt a típust és ellenőrzést használja
 * a kliens (gyors visszajelzés) és a szerver (API route, megbízható ellenőrzés).
 */

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  /** Honeypot mező a botok kiszűrésére. Embereknek üresnek kell maradnia. */
  company?: string;
};

export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: Partial<ContactInput>): {
  ok: boolean;
  errors: FieldErrors;
  data: ContactInput;
} {
  const data: ContactInput = {
    name: (input.name ?? "").trim(),
    email: (input.email ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    message: (input.message ?? "").trim(),
    company: (input.company ?? "").trim(),
  };

  const errors: FieldErrors = {};

  if (data.name.length < 2) {
    errors.name = "Kérlek, add meg a neved.";
  }
  if (!EMAIL_RE.test(data.email)) {
    errors.email = "Adj meg egy érvényes e-mail címet.";
  }
  if (data.phone && data.phone.replace(/[\s+\-()]/g, "").length < 6) {
    errors.phone = "A telefonszám túl rövidnek tűnik.";
  }
  if (data.message.length < 10) {
    errors.message = "Írj néhány mondatot arról, mire van szükséged.";
  }
  if (data.message.length > 5000) {
    errors.message = "Az üzenet túl hosszú.";
  }

  return { ok: Object.keys(errors).length === 0, errors, data };
}
