import { revalidatePath } from 'next/cache';
import { requireApiSession, isSameOrigin } from '@/lib/auth/session';
import { deletePost, getPostById, updatePost } from '@/lib/store/posts';
import { validatePost } from '@/lib/validation';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;

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

  // A régi slug is érvénytelenítendő: átnevezés után a korábbi útvonalnak 404-et
  // kell adnia, nem a cache-ből kiszolgált régi oldalt.
  const previous = await getPostById(id);
  const post = await updatePost(id, result.value);
  if (!post) {
    return Response.json({ error: 'A bejegyzés nem található.' }, { status: 404 });
  }

  if (previous && previous.slug !== post.slug) revalidatePath(`/blog/${previous.slug}`);
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');

  return Response.json({ ok: true, post });
}

export async function DELETE(request: Request, { params }: Params): Promise<Response> {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }

  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const post = await getPostById(id);
  const removed = await deletePost(id);

  if (!removed) {
    return Response.json({ error: 'A bejegyzés nem található.' }, { status: 404 });
  }

  if (post) revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/blog');
  revalidatePath('/');

  return Response.json({ ok: true });
}
