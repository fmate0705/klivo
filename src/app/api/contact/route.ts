import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validation";
import { sendContactEmail, isEmailConfigured } from "@/lib/email";
import { contact } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Érvénytelen kérés." },
      { status: 400 }
    );
  }

  const input = (body ?? {}) as Record<string, unknown>;

  // Honeypot: ha ki van töltve, valószínűleg bot. Csendben "sikert" jelzünk.
  if (typeof input.company === "string" && input.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { ok, errors, data } = validateContact({
    name: typeof input.name === "string" ? input.name : "",
    email: typeof input.email === "string" ? input.email : "",
    phone: typeof input.phone === "string" ? input.phone : "",
    message: typeof input.message === "string" ? input.message : "",
  });

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Hibás vagy hiányzó mezők.", fields: errors },
      { status: 422 }
    );
  }

  if (!isEmailConfigured()) {
    // Nincs SMTP beállítva: ne tegyünk úgy, mintha elküldtük volna az üzenetet.
    console.warn(
      "[contact] SMTP nincs beállítva, az üzenet nem lett kiküldve:",
      data.email
    );
    return NextResponse.json(
      {
        ok: false,
        error: `Az e-mail küldés jelenleg nincs beállítva. Írj közvetlenül: ${contact.email}`,
      },
      { status: 503 }
    );
  }

  try {
    await sendContactEmail(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] e-mail küldési hiba:", err);
    return NextResponse.json(
      { ok: false, error: "Nem sikerült elküldeni az üzenetet." },
      { status: 502 }
    );
  }
}
