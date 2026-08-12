import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/card';
import { formatDate, toDateAttribute } from '@/lib/format';
import type { Post } from '@/lib/store/posts';

/**
 * Egy bejegyzés kártyája a blog rácsban.
 *
 * A teljes kártya kattintható — a cím linkje egy pszeudoelemmel kiterjed az
 * egész felületre, így a kép és a bevezető is a cikkre visz, de a felolvasó
 * továbbra is egyetlen, értelmes szövegű linket lát.
 *
 * A `featured` változat az első bejegyzésé: szélesebb, nagyobb képpel. Ettől lesz
 * a rácsnak eleje, ahonnan a szem elindul, ahelyett hogy egyszerre öt egyforma
 * doboz kérné a figyelmet.
 */
export function PostCard({
  post,
  featured = false,
  priority = false,
}: {
  post: Post;
  featured?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      data-reveal
      className={[
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised',
        'transition-[transform,box-shadow,border-color] duration-normal ease-expo',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-lg',
        featured ? 'lg:col-span-2 lg:flex-row' : '',
      ].join(' ')}
    >
      {post.image ? (
        <div
          className={[
            'relative overflow-hidden bg-surface',
            featured ? 'aspect-[16/10] lg:aspect-auto lg:w-1/2' : 'aspect-[16/10]',
          ].join(' ')}
        >
          <Image
            src={post.image}
            alt={post.imageAlt || ''}
            fill
            priority={priority}
            sizes={
              featured ? '(min-width: 1024px) 34rem, 100vw' : '(min-width: 1024px) 22rem, 100vw'
            }
            className="object-cover transition-transform duration-slower ease-expo group-hover:scale-[1.04]"
          />
        </div>
      ) : null}

      <div
        className={['flex flex-1 flex-col p-7', featured ? 'lg:justify-center lg:p-10' : ''].join(
          ' ',
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="primary">{post.category}</Badge>
          <span className="text-sm text-subtle">{post.readingMinutes} perc olvasás</span>
        </div>

        <h3 className={['mt-4', featured ? 'text-2xl sm:text-3xl' : 'text-xl'].join(' ')}>
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 leading-relaxed text-muted">{post.excerpt}</p>

        {/* A dátum a kártya aljára tapad (`mt-auto`), így a különböző hosszúságú
            bevezetők mellett is egy vonalban áll a rács minden kártyáján. */}
        <div className="mt-auto flex items-center gap-3 pt-6 text-sm text-subtle">
          <time dateTime={toDateAttribute(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.author}</span>
        </div>
      </div>
    </article>
  );
}
