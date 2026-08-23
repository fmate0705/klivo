import { revalidatePath } from 'next/cache';
import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { createPost } from '@/lib/store/posts';
import { validatePost } from '@/lib/validation';

export const runtime = 'nodejs';

/** Új bejegyzés létrehozása. */
export async function POST(request: Request): Promise<Response> {
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

  const result = validatePost(payload);
  if (!result.ok) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }

  const post = await createPost(result.value);

  // A blog oldalai ISR-rel élnek; a friss bejegyzésnek nem kell megvárnia az
  // ötperces ablakot.
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');

  return Response.json({ ok: true, post }, { status: 201 });
}
