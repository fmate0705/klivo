import type { Post } from '@/lib/store/posts';
import { formatDate, toDateAttribute } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Card, CardLink } from '@/components/ui/card';
import { PostCover } from '@/components/blog/post-cover';

/**
 * Bejegyzés kártya.
 *
 * A borító a kártya tetején ül, teljes szélességben — a képet a kártya kerete
 * vágja, nincs körülötte külön keret. A cím a hivatkozás, és a `::after`
 * rétegével az egész kártya kattintható.
 *
 * A dátum és az olvasási idő a kártya alján, egy sorban: mindkettő döntési
 * információ (friss-e, van-e most rá időm), nem díszítés.
 *
 * A `featured` változat két hasábot foglal, és széles nézetben fekvő: a kép
 * bal oldalt, a szöveg jobbra. Ez a lista belépési pontja — egy egyforma
 * kártyákból álló rácsban nincs hova nézni először.
 */
export function PostCard({
  post,
  featured = false,
  sizes = '(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw',
  className,
}: {
  post: Post;
  /** Kiemelt bejegyzés: két hasáb, fekvő elrendezés. */
  featured?: boolean;
  sizes?: string;
  className?: string;
}) {
  const published = post.publishedAt ?? post.createdAt;

  return (
    <Card
      interactive
      className={cn(
        'flex min-w-0 flex-col overflow-hidden p-0',
        featured && 'lg:flex-row',
        className,
      )}
    >
      <PostCover
        slug={post.slug}
        {...(post.image ? { image: post.image, imageAlt: post.imageAlt } : {})}
        sizes={featured ? '(min-width: 1024px) 44vw, 100vw' : sizes}
        fill={featured}
        className={cn(
          'border-soft w-full border-b',
          featured
            ? 'aspect-[16/9] lg:aspect-auto lg:w-1/2 lg:border-b-0 lg:border-r'
            : 'aspect-[16/9]',
        )}
      />

      <div className={cn('flex flex-1 flex-col p-6', featured && 'lg:justify-center lg:p-9')}>
        <p className="text-body-sm text-ink">{post.category}</p>

        <h3 className={cn('mt-2', featured ? 'text-h4' : 'text-h5')}>
          <CardLink href={`/blog/${post.slug}`}>{post.title}</CardLink>
        </h3>

        <p className="mt-3 text-body-sm text-soft">{post.excerpt}</p>

        <p className="mt-auto flex items-center gap-2 pt-6 text-body-sm text-soft">
          <time dateTime={toDateAttribute(published)}>{formatDate(published)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} perc olvasás</span>
        </p>
      </div>
    </Card>
  );
}
