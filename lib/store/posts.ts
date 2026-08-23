import { revalidateTag, unstable_cache } from 'next/cache';
import { createCollection, createId } from './json-store';

/**
 * Blog posts. Body is Markdown (a deliberately small subset — see
 * `lib/markdown.ts`) so the admin editor stays a plain textarea and the render
 * path has no third-party HTML in it.
 */
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  /** Path under /public, or empty when the post has no cover image. */
  image: string;
  /** Alt text for the cover image. Empty means decorative. */
  imageAlt: string;
  author: string;
  readingMinutes: number;
  published: boolean;
  /** ISO-8601. Set on first publish, preserved afterwards. */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = Omit<
  Post,
  'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'readingMinutes'
>;

const posts = createCollection<Post>('posts.json');

/**
 * A bejegyzéseket megjelenítő oldalak gyorsítótár-címkéje.
 *
 * A blog lista, a cikkoldalak, a főoldali kiemelés és a sitemap mind ugyanabból
 * az olvasásból dolgozik. Egyetlen címke érvényteleníti mindet — útvonalanként
 * felsorolva egy új megjelenési hely némán kimaradna, és a régi tartalmat
 * szolgálná ki tovább.
 */
export const POSTS_TAG = 'posts';

/** Gyorsítótárazott, címkézett olvasás. A mutációk után azonnal frissül. */
/**
 * Gyorsítótárazott, címkézett olvasás.
 *
 * A kulcs része a fájl ujjlenyomata: ha a JSON két build között megváltozott,
 * a régi, `.next/cache`-ben őrzött bejegyzés nem talál — enélkül egy új build
 * a régi tartalmat sütné bele a statikus oldalakba.
 */
const readPosts = unstable_cache(async () => posts.read(), ['klivo-posts', posts.fingerprint()], {
  tags: [POSTS_TAG],
});

/** Average adult reading speed for Hungarian prose, rounded to a safe floor. */
const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Newest first. Unpublished posts are never returned to the public site. */
function byNewest(a: Post, b: Post): number {
  const left = a.publishedAt ?? a.createdAt;
  const right = b.publishedAt ?? b.createdAt;
  return right.localeCompare(left);
}

export async function listPosts(): Promise<Post[]> {
  return [...(await readPosts())].sort(byNewest);
}

export async function listPublishedPosts(): Promise<Post[]> {
  return (await readPosts()).filter((post) => post.published).sort(byNewest);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await readPosts()).find((post) => post.slug === slug);
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | undefined> {
  const post = await getPostBySlug(slug);
  return post?.published ? post : undefined;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  return (await readPosts()).find((post) => post.id === id);
}

/** Posts in the same category, excluding the current one. */
export async function getRelatedPosts(post: Post, limit = 2): Promise<Post[]> {
  const published = await listPublishedPosts();
  const sameCategory = published.filter((p) => p.id !== post.id && p.category === post.category);
  const rest = published.filter((p) => p.id !== post.id && p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function listCategories(): Promise<string[]> {
  const published = await listPublishedPosts();
  return [...new Set(published.map((post) => post.category))].sort((a, b) =>
    a.localeCompare(b, 'hu'),
  );
}

export async function createPost(input: PostInput): Promise<Post> {
  const now = new Date().toISOString();
  const created = await posts.mutate((items) => {
    const post: Post = {
      ...input,
      id: createId(),
      slug: uniqueSlug(items, input.slug, null),
      readingMinutes: estimateReadingMinutes(input.body),
      publishedAt: input.published ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    return { items: [post, ...items], result: post };
  });

  revalidateTag(POSTS_TAG);
  return created;
}

export async function updatePost(id: string, input: PostInput): Promise<Post | undefined> {
  const now = new Date().toISOString();
  const updated = await posts.mutate((items) => {
    const index = items.findIndex((post) => post.id === id);
    if (index === -1) return { items, result: undefined };

    const previous = items[index] as Post;
    const next: Post = {
      ...previous,
      ...input,
      slug: uniqueSlug(items, input.slug, id),
      readingMinutes: estimateReadingMinutes(input.body),
      // First publish stamps the date; later edits never move it.
      publishedAt: input.published ? (previous.publishedAt ?? now) : null,
      updatedAt: now,
    };

    const copy = [...items];
    copy[index] = next;
    return { items: copy, result: next };
  });

  revalidateTag(POSTS_TAG);
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  const removed = await posts.mutate((items) => {
    const next = items.filter((post) => post.id !== id);
    return { items: next, result: next.length !== items.length };
  });

  revalidateTag(POSTS_TAG);
  return removed;
}

/**
 * Guarantees slug uniqueness by appending `-2`, `-3`, … when needed.
 * `ignoreId` lets a post keep its own slug while being edited.
 */
function uniqueSlug(items: Post[], desired: string, ignoreId: string | null): string {
  const taken = new Set(items.filter((post) => post.id !== ignoreId).map((post) => post.slug));
  if (!taken.has(desired)) return desired;

  let suffix = 2;
  while (taken.has(`${desired}-${suffix}`)) suffix += 1;
  return `${desired}-${suffix}`;
}
