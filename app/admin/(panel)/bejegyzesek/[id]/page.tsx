import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostEditor } from '@/components/admin/post-editor';
import { formatDateTime } from '@/lib/format';
import { getPostById } from '@/lib/store/posts';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/bejegyzesek" className="text-sm text-muted hover:text-foreground">
          ← Bejegyzések
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">{post.title}</h1>
        <p className="mt-1 text-muted">
          Létrehozva: {formatDateTime(post.createdAt)} · Módosítva: {formatDateTime(post.updatedAt)}
        </p>
      </header>

      <PostEditor post={post} />
    </div>
  );
}
