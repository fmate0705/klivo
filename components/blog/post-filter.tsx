'use client';

import { useState } from 'react';
import type { Post } from '@/lib/store/posts';
import { cn } from '@/lib/cn';
import { Reveal, staggerDelay } from '@/components/motion/reveal';
import { PostCard } from '@/components/blog/post-card';

/**
 * A bejegyzések listája, rovat szerinti szűréssel.
 *
 * A szűrés kliensen történik és nem szerveren, mert a bejegyzések száma kicsi
 * (a teljes lista amúgy is átjön), a váltás így azonnali, és az URL nem
 * szemetelődik tele szűrőparaméterekkel, amelyeket aztán a keresőnek is
 * kezelnie kellene.
 *
 * A szűrőgombok `aria-pressed`-del jelzik az állapotukat, az eredményszám pedig
 * `aria-live`-val megy ki: aki nem látja a rácsot, az is megtudja, hogy
 * változott, és mennyire.
 */
export function PostFilter({ posts, categories }: { posts: Post[]; categories: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  const visible = active ? posts.filter((post) => post.category === active) : posts;

  return (
    <div>
      {categories.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={active === null} onClick={() => setActive(null)}>
            Összes
          </FilterButton>
          {categories.map((category) => (
            <FilterButton
              key={category}
              active={active === category}
              onClick={() => setActive(category)}
            >
              {category}
            </FilterButton>
          ))}
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {visible.length} bejegyzés látható.
      </p>

      {/* Szabályos rács, egyetlen kiemeléssel: a legfrissebb bejegyzés két
          hasábot foglal, és fekvő elrendezésben áll. A többi egyforma. Így van
          belépési pont a listába anélkül, hogy a rács szétesne. */}
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post, index) => (
          <Reveal
            as="li"
            key={post.id}
            delay={staggerDelay(index, 50)}
            className={cn('flex min-w-0', index === 0 && 'lg:col-span-2')}
          >
            <PostCard post={post} featured={index === 0} className="w-full" />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 items-center rounded-pill border px-4 text-body-sm transition-colors duration-feedback ease-standard',
        active
          ? 'border-ink bg-deep text-on-dark'
          : 'border-soft bg-raised text-soft hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
