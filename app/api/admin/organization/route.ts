import { revalidatePath } from 'next/cache';
import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import {
  CONTACT_FIELDS,
  COMPANY_FIELDS,
  ORGANIZATION_MAX_LENGTH,
  updateOrganization,
  type Company,
  type Contact,
} from '@/lib/store/settings';
import { validateOrganizationValue } from '@/lib/validation';

export const runtime = 'nodejs';

/**
 * Elérhetőség és cégadatok mentése.
 *
 * Csak a mezőlistában szereplő kulcsokat fogadjuk el — az admin űrlap és a
 * végpont ugyanabból a leírásból dolgozik, tehát nem csúszhatnak szét.
 */
export async function PUT(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Hibás kérés.' }, { status: 400 });
  }

  const input = (payload ?? {}) as Record<string, unknown>;
  const contact: Record<string, string> = {};
  const company: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const field of [...CONTACT_FIELDS, ...COMPANY_FIELDS]) {
    if (!(field.key in input)) continue;

    const result = validateOrganizationValue(input[field.key], ORGANIZATION_MAX_LENGTH);
    if (!result.ok) {
      errors[field.key] = result.errors.field ?? 'Érvénytelen érték.';
      continue;
    }

    if (field.group === 'contact') contact[field.key] = result.value;
    else company[field.key] = result.value;
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 422 });
  }

  const settings = await updateOrganization({
    contact: contact as Partial<Contact>,
    company: company as Partial<Company>,
  });

  // A cégadatok a lábléctől a jogi oldalakig mindenhol megjelennek, és a
  // strukturált adatba is bekerülnek — ezért a teljes nyilvános felületet
  // újragenerálásra jelöljük, nem csak egy-két útvonalat.
  //
  // A `'layout'` változat a keret alá tartozó összes útvonalat érinti, a
  // konkrét útvonalak viszont külön is szerepelnek: a gyökér oldal
  // gyorsítótárát a `layout` hatókör önmagában nem minden esetben üríti, és egy
  // elavult telefonszám a főoldal láblécében pont az a hiba, amit ez a végpont
  // hivatott megelőzni.
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/kapcsolat');
  revalidatePath('/jogi/impresszum');
  revalidatePath('/jogi/aszf');
  revalidatePath('/jogi/adatkezelesi-tajekoztato');
  revalidatePath('/jogi/cookie-tajekoztato');
  revalidatePath('/llms.txt');

  return Response.json({ ok: true, settings });
}
