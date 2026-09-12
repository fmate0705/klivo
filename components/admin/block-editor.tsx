'use client';

import { useRef, useState } from 'react';
import {
  MAX_BLOCK_ITEMS,
  MAX_WORK_BLOCKS,
  WORK_BLOCK_LIMITS,
  WORK_BLOCK_TEMPLATES,
  WORK_RATIOS,
  blankBlock,
  blockLabel,
  ratioOf,
  type WorkBlock,
  type WorkBlockType,
  type WorkRatio,
} from '@/lib/content/work-blocks';
import { cn } from '@/lib/cn';
import { adminInputClass } from './ui';
import { ImagePicker } from './image-picker';

/**
 * Az oldalszerkesztő — sablonokból összerakott referencia oldal.
 *
 * **Mit tud, és mit nem, szándékosan.** A szerkesztő sablonokat *húz* a lapra,
 * sorba rendezi őket, és kitölti a mezőiket. Amit nem tud: szabadon formázni. Ez
 * nem hiányzó funkció, hanem a rendszer lényege — a tipográfiát és az
 * elrendezést a kód adja (`components/works/work-blocks.tsx`), így minden
 * referencia oldal egyformán néz ki, és nincs olyan mező, amin HTML jöhetne be.
 *
 * **A húzás mellett mindig van gomb.** A fogd-és-vidd önmagában nem
 * hozzáférhető: egérrel megy, billentyűzettel nem. Ezért minden blokk fejlécén
 * ott a „föl” és a „le” gomb is, és azok a tényleges vezérlők — a húzás csak
 * kényelmi réteg fölöttük.
 *
 * **Miért nincs beépített előnézet.** Egy hozzávetőleges előnézet rosszabb a
 * semminél: elhiteti, hogy a kész oldalt mutatja. A publikálás kapcsolója
 * viszont ott van a szerkesztőben, tehát a valódi oldal egy kattintásra
 * megnézhető — az pontos.
 */

/** Mi utazik a húzásban: új blokk a palettáról, vagy egy meglévő áthelyezése. */
type Drag = { kind: 'new'; type: WorkBlockType } | { kind: 'move'; index: number };

export function BlockEditor({
  blocks,
  onChange,
  disabled = false,
}: {
  blocks: WorkBlock[];
  onChange: (blocks: WorkBlock[]) => void;
  disabled?: boolean;
}) {
  /**
   * A húzás terhe **refben**, nem állapotban.
   *
   * A `dataTransfer` tartalmát a böngészők egy része `dragover` közben
   * biztonsági okból nem engedi kiolvasni, állapotban tartva pedig minden
   * `dragover` újrarenderelne. A ref mindkettőt megoldja.
   */
  const drag = useRef<Drag | null>(null);
  /** Hova kerülne a blokk, ha most engednénk el. */
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const full = blocks.length >= MAX_WORK_BLOCKS;

  function commit(next: WorkBlock[]) {
    onChange(next);
  }

  function insert(type: WorkBlockType, at: number) {
    if (full) return;
    const next = [...blocks];
    next.splice(at, 0, blankBlock(type, newId()));
    commit(next);
  }

  function move(from: number, to: number) {
    if (from === to || from + 1 === to) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(from < to ? to - 1 : to, 0, moved);
    commit(next);
  }

  /** A „föl”/„le” gomb — ez a billentyűzettel is elérhető átrendezés. */
  function shift(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    commit(next);
  }

  function duplicate(index: number) {
    if (full) return;
    const source = blocks[index];
    if (!source) return;
    const next = [...blocks];
    next.splice(index + 1, 0, { ...source, id: newId() });
    commit(next);
  }

  function remove(index: number) {
    commit(blocks.filter((_, position) => position !== index));
  }

  function replace(index: number, block: WorkBlock) {
    commit(blocks.map((item, position) => (position === index ? block : item)));
  }

  function drop(at: number) {
    const payload = drag.current;
    drag.current = null;
    setDropIndex(null);
    if (!payload || disabled) return;

    if (payload.kind === 'new') insert(payload.type, at);
    else move(payload.index, at);
  }

  /** A mutató a blokk felső vagy alsó feléhez közelebb van-e. */
  function edgeIndex(event: React.DragEvent<HTMLElement>, index: number): number {
    const box = event.currentTarget.getBoundingClientRect();
    return event.clientY < box.top + box.height / 2 ? index : index + 1;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      <div className="rounded-card border border-line bg-surface p-5 lg:sticky lg:top-8">
        <h3 className="text-body-sm font-semibold">Szekciósablonok</h3>
        <p className="mt-1 text-body-sm text-muted">
          Húzd a lapra, vagy kattints rá — a végére kerül. Utána már csak tartalom kell bele.
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          {WORK_BLOCK_TEMPLATES.map((template) => (
            <li key={template.type}>
              <button
                type="button"
                draggable={!disabled && !full}
                onDragStart={() => {
                  drag.current = { kind: 'new', type: template.type };
                }}
                onDragEnd={() => {
                  drag.current = null;
                  setDropIndex(null);
                }}
                onClick={() => insert(template.type, blocks.length)}
                disabled={disabled || full}
                className={cn(
                  'w-full rounded-card border border-line-strong bg-paper px-3.5 py-2.5 text-left',
                  'transition-colors duration-feedback ease-standard',
                  'hover:border-wave-6 hover:bg-sky disabled:opacity-50 disabled:hover:border-line-strong disabled:hover:bg-paper',
                )}
              >
                <span className="block text-body-sm font-medium">{template.label}</span>
                <span className="mt-0.5 block text-body-sm text-muted">{template.hint}</span>
              </button>
            </li>
          ))}
        </ul>

        {full ? (
          <p className="mt-4 text-body-sm text-danger">
            Elérted a {MAX_WORK_BLOCKS} szekciós határt. Előbb törölj egyet.
          </p>
        ) : null}
      </div>

      <div className="min-w-0">
        {blocks.length === 0 ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDropIndex(0);
            }}
            onDrop={(event) => {
              event.preventDefault();
              drop(0);
            }}
            className={cn(
              'rounded-card border-2 border-dashed border-line-strong px-6 py-16 text-center',
              dropIndex === 0 && 'border-wave-6 bg-sky',
            )}
          >
            <p className="text-body-sm font-medium">Üres oldal</p>
            <p className="mt-1 text-body-sm text-muted">
              Húzz ide egy sablont a bal oldali listáról, és kezdd el kitölteni.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {blocks.map((block, index) => (
              <li key={block.id}>
                <DropLine active={dropIndex === index} />

                <div
                  onDragOver={(event) => {
                    if (!drag.current) return;
                    event.preventDefault();
                    setDropIndex(edgeIndex(event, index));
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    drop(edgeIndex(event, index));
                  }}
                  className="rounded-card border border-line bg-surface"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        draggable={!disabled}
                        onDragStart={() => {
                          drag.current = { kind: 'move', index };
                        }}
                        onDragEnd={() => {
                          drag.current = null;
                          setDropIndex(null);
                        }}
                        // A fogantyú csak egérrel működik, ezért a
                        // képernyőolvasó elől el van rejtve: a tényleges
                        // vezérlők a mellette lévő gombok.
                        aria-hidden="true"
                        className="cursor-grab select-none px-1 text-muted active:cursor-grabbing"
                        title="Húzd át máshova"
                      >
                        ⠿
                      </span>
                      <span className="truncate text-body-sm font-semibold">
                        {index + 1}. {blockLabel(block.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <IconButton
                        label={`Föl: ${blockLabel(block.type)}`}
                        onClick={() => shift(index, -1)}
                        disabled={disabled || index === 0}
                      >
                        ↑
                      </IconButton>
                      <IconButton
                        label={`Le: ${blockLabel(block.type)}`}
                        onClick={() => shift(index, 1)}
                        disabled={disabled || index === blocks.length - 1}
                      >
                        ↓
                      </IconButton>
                      <IconButton
                        label={`Másolat: ${blockLabel(block.type)}`}
                        onClick={() => duplicate(index)}
                        disabled={disabled || full}
                      >
                        ⧉
                      </IconButton>
                      <IconButton
                        label={`Törlés: ${blockLabel(block.type)}`}
                        onClick={() => remove(index)}
                        disabled={disabled}
                        tone="danger"
                      >
                        ✕
                      </IconButton>
                    </div>
                  </header>

                  <div className="flex flex-col gap-4 px-4 py-4">
                    <BlockFields
                      block={block}
                      onChange={(next) => replace(index, next)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </li>
            ))}

            {/* A lista végi ejtősáv: enélkül az utolsó blokk alá nem lehetne
                behúzni semmit. */}
            <li>
              <div
                onDragOver={(event) => {
                  if (!drag.current) return;
                  event.preventDefault();
                  setDropIndex(blocks.length);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  drop(blocks.length);
                }}
                className="pt-3"
              >
                <div
                  className={cn(
                    'rounded-card border-2 border-dashed border-line px-4 py-6 text-center text-body-sm text-muted',
                    dropIndex === blocks.length && 'border-wave-6 bg-sky',
                  )}
                >
                  Ide húzva a lap végére kerül
                </div>
              </div>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

/** A beszúrás helyét jelző vonal két blokk között. */
function DropLine({ active }: { active: boolean }) {
  return (
    <div className="h-3">
      <div
        className={cn(
          'mx-auto h-0.5 rounded-pill transition-colors duration-feedback',
          active ? 'bg-wave-7' : 'bg-transparent',
        )}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  tone = 'normal',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'normal' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-card border border-line text-body-sm',
        'transition-colors duration-feedback ease-standard disabled:opacity-40',
        tone === 'danger'
          ? 'text-danger hover:border-danger/40 hover:bg-danger/5'
          : 'text-muted hover:border-line-strong hover:bg-sky hover:text-ink',
      )}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* A blokkok mezői                                                             */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-body-sm font-medium">{label}</span>
      {hint ? <span className="mt-1 block text-body-sm text-muted">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

/** A hosszabb szövegmezőknél kiírjuk, mit tud a szűk Markdown nyelvtan. */
const MARKDOWN_HINT = 'Formázás: **félkövér**, *dőlt*, - felsorolás, ## alcím.';

function BlockFields({
  block,
  onChange,
  disabled,
}: {
  block: WorkBlock;
  onChange: (block: WorkBlock) => void;
  disabled: boolean;
}) {
  const limits = WORK_BLOCK_LIMITS;

  switch (block.type) {
    case 'lead':
      return (
        <Field label="Felvezető" hint="Egy bekezdés, nagy betűvel szedve.">
          <textarea
            rows={3}
            value={block.text}
            maxLength={limits.lead}
            disabled={disabled}
            onChange={(event) => onChange({ ...block, text: event.target.value })}
            className={adminInputClass()}
          />
        </Field>
      );

    case 'text':
      return (
        <>
          <Field label="Alcím" hint="Elhagyható — cím nélkül csak a szöveg jelenik meg.">
            <input
              value={block.title}
              maxLength={limits.title}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, title: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
          <Field label="Szöveg" hint={MARKDOWN_HINT}>
            <textarea
              rows={7}
              value={block.body}
              maxLength={limits.body}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, body: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
        </>
      );

    case 'image':
      return (
        <>
          <ImagePicker
            label="Kép"
            hint="WebP, PNG, JPEG vagy AVIF, legfeljebb 4 MB. Fekvő, 16:9 arányú kép a legjobb."
            value={block.image}
            disabled={disabled}
            onChange={(image) => onChange({ ...block, image })}
          />
          <Field label="Képleírás" hint="Mit ábrázol a kép? Képernyőolvasó ezt olvassa fel.">
            <input
              value={block.alt}
              maxLength={limits.alt}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, alt: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
          <Field label="Képaláírás" hint="Elhagyható. A kép alatt jelenik meg.">
            <input
              value={block.caption}
              maxLength={limits.caption}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, caption: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
        </>
      );

    case 'split':
      return (
        <>
          <Field label="Alcím">
            <input
              value={block.title}
              maxLength={limits.title}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, title: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
          <Field label="Szöveg" hint={MARKDOWN_HINT}>
            <textarea
              rows={5}
              value={block.body}
              maxLength={limits.body}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, body: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
          <ImagePicker
            label="Kép"
            value={block.image}
            disabled={disabled}
            onChange={(image) => onChange({ ...block, image })}
          />
          <Field label="Képleírás">
            <input
              value={block.alt}
              maxLength={limits.alt}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, alt: event.target.value })}
              className={adminInputClass()}
            />
          </Field>

          <Field
            label="Képarány"
            hint="A kép erre az arányra vágódik, és ez dönti el a hasábok osztását is — fekvő képnek szélesebb hely jut, állónak keskenyebb. Így a szöveg soha nem szorul össze a kép mellett."
          >
            <div className="flex flex-wrap gap-2">
              {WORK_RATIOS.map((option) => {
                const picked = ratioOf(block.ratio).value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange({ ...block, ratio: option.value as WorkRatio })}
                    className={cn(
                      'flex items-center gap-2 rounded-card border px-3 py-2 text-body-sm',
                      'transition-colors duration-feedback ease-standard disabled:opacity-50',
                      picked
                        ? 'border-wave-6 bg-sky font-medium'
                        : 'border-line hover:border-line-strong',
                    )}
                  >
                    {/* Apró előnézet a valódi arányban: a felirat megmondja,
                        mi lesz, ez pedig megmutatja. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'block h-5 shrink-0 rounded-[3px] border',
                        option.aspect,
                        picked ? 'border-wave-7 bg-wave-4' : 'border-line-strong bg-wave-2',
                      )}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <label className="flex items-center gap-3 text-body-sm">
            <input
              type="checkbox"
              checked={block.flip}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, flip: event.target.checked })}
              className="h-4 w-4"
            />
            Kép a jobb oldalra
          </label>
        </>
      );

    case 'stats':
      return (
        <>
          <Field label="Alcím" hint="Elhagyható.">
            <input
              value={block.title}
              maxLength={limits.title}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, title: event.target.value })}
              className={adminInputClass()}
            />
          </Field>

          <RowList
            label="Eredmények"
            hint="Bal oldalt a szám, jobb oldalt az, hogy mit mér."
            count={block.items.length}
            disabled={disabled}
            onAdd={() => onChange({ ...block, items: [...block.items, { value: '', label: '' }] })}
            onRemove={(index) =>
              onChange({ ...block, items: block.items.filter((_, i) => i !== index) })
            }
          >
            {block.items.map((item, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <input
                  value={item.value}
                  maxLength={limits.statValue}
                  disabled={disabled}
                  placeholder="pl. 2,1 mp"
                  onChange={(event) =>
                    onChange({
                      ...block,
                      items: block.items.map((row, i) =>
                        i === index ? { ...row, value: event.target.value } : row,
                      ),
                    })
                  }
                  className={adminInputClass()}
                />
                <input
                  value={item.label}
                  maxLength={limits.statLabel}
                  disabled={disabled}
                  placeholder="pl. betöltési idő mobilon"
                  onChange={(event) =>
                    onChange({
                      ...block,
                      items: block.items.map((row, i) =>
                        i === index ? { ...row, label: event.target.value } : row,
                      ),
                    })
                  }
                  className={adminInputClass()}
                />
              </div>
            ))}
          </RowList>
        </>
      );

    case 'quote':
      return (
        <>
          <Field label="Idézet" hint="Az idézőjeleket az oldal teszi ki.">
            <textarea
              rows={3}
              value={block.text}
              maxLength={limits.quote}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, text: event.target.value })}
              className={adminInputClass()}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ki mondta">
              <input
                value={block.author}
                maxLength={limits.author}
                disabled={disabled}
                onChange={(event) => onChange({ ...block, author: event.target.value })}
                className={adminInputClass()}
              />
            </Field>
            <Field label="Beosztás" hint="Elhagyható.">
              <input
                value={block.role}
                maxLength={limits.role}
                disabled={disabled}
                onChange={(event) => onChange({ ...block, role: event.target.value })}
                className={adminInputClass()}
              />
            </Field>
          </div>
        </>
      );

    case 'list':
      return (
        <>
          <Field label="Alcím" hint="Elhagyható.">
            <input
              value={block.title}
              maxLength={limits.title}
              disabled={disabled}
              onChange={(event) => onChange({ ...block, title: event.target.value })}
              className={adminInputClass()}
            />
          </Field>

          <RowList
            label="Tételek"
            count={block.items.length}
            disabled={disabled}
            onAdd={() => onChange({ ...block, items: [...block.items, ''] })}
            onRemove={(index) =>
              onChange({ ...block, items: block.items.filter((_, i) => i !== index) })
            }
          >
            {block.items.map((item, index) => (
              <input
                key={index}
                value={item}
                maxLength={limits.listItem}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...block,
                    items: block.items.map((row, i) => (i === index ? event.target.value : row)),
                  })
                }
                className={adminInputClass()}
              />
            ))}
          </RowList>
        </>
      );

    case 'gallery':
      return (
        <RowList
          label="Képek"
          hint="Kettő vagy három kép fér el egymás mellett."
          count={block.images.length}
          disabled={disabled}
          onAdd={() => onChange({ ...block, images: [...block.images, { src: '', alt: '' }] })}
          onRemove={(index) =>
            onChange({ ...block, images: block.images.filter((_, i) => i !== index) })
          }
        >
          {block.images.map((image, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-card border border-line p-3">
              <ImagePicker
                label={`${index + 1}. kép`}
                value={image.src}
                disabled={disabled}
                onChange={(src) =>
                  onChange({
                    ...block,
                    images: block.images.map((row, i) => (i === index ? { ...row, src } : row)),
                  })
                }
              />
              <Field label="Képleírás">
                <input
                  value={image.alt}
                  maxLength={limits.alt}
                  disabled={disabled}
                  onChange={(event) =>
                    onChange({
                      ...block,
                      images: block.images.map((row, i) =>
                        i === index ? { ...row, alt: event.target.value } : row,
                      ),
                    })
                  }
                  className={adminInputClass()}
                />
              </Field>
            </div>
          ))}
        </RowList>
      );
  }
}

/**
 * Ismétlődő sorok — eredmények, felsorolás, galéria.
 *
 * A törlés soronként külön gomb, nem egy „utolsó sor eltávolítása”: a
 * szerkesztő általában nem az utolsót akarja kivenni.
 */
function RowList({
  label,
  hint,
  count,
  disabled,
  onAdd,
  onRemove,
  children,
}: {
  label: string;
  hint?: string;
  count: number;
  disabled: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  children: React.ReactNode[];
}) {
  return (
    <div>
      <p className="text-body-sm font-medium">{label}</p>
      {hint ? <p className="mt-1 text-body-sm text-muted">{hint}</p> : null}

      <ul className="mt-2 flex flex-col gap-3">
        {children.map((row, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">{row}</div>
            <IconButton
              label={`${index + 1}. sor törlése`}
              onClick={() => onRemove(index)}
              disabled={disabled || count <= 1}
              tone="danger"
            >
              ✕
            </IconButton>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled || count >= MAX_BLOCK_ITEMS}
        className="mt-3 rounded-card border border-line-strong px-3 py-1.5 text-body-sm transition-colors duration-feedback hover:border-wave-6 hover:bg-sky disabled:opacity-40"
      >
        + Új sor
      </button>
    </div>
  );
}

/**
 * Blokkazonosító.
 *
 * `crypto.randomUUID` ott, ahol van; a tartalék a régebbi böngészőké. Az érték
 * csak a szerkesztésen belül azonosít, tehát az ütközésmentességen kívül nincs
 * vele szemben elvárás.
 */
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
