import { describe, expect, it } from 'vitest';
import { cleanSettings, validatePartner, validateWork } from '@/lib/validation';
import { MAX_WORK_BLOCKS } from '@/lib/content/work-blocks';

/**
 * A referenciák törzsét az admin rakja össze sablonblokkokból. A validáció két
 * dolgot garantál, és ez a fájl mindkettőt rögzíti: **ismeretlen blokktípus
 * nem jut át** (a megjelenítés nem tudna vele mit kezdeni), és **külső
 * médiaútvonal sem** (az követhetővé tenné a látogatót egy idegen szerveren).
 */

const valid = {
  client: 'Példa Kft.',
  title: 'Új webshop és foglalási rendszer',
  excerpt: 'Három hét alatt új webshopot kapott a cég, saját admin felülettel.',
  blocks: [],
};

describe('validateWork', () => {
  it('elfogad egy helyesen kitöltött referenciát', () => {
    const result = validateWork(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Slug híján az ügyfél nevéből és a címből képződik.
      expect(result.value.slug).toBe('pelda-kft-uj-webshop-es-foglalasi-rendszer');
    }
  });

  it('kifogásolja a hiányzó ügyfelet', () => {
    const result = validateWork({ ...valid, client: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.client).toBeTruthy();
  });

  it('nem enged külső címet az élő oldal mezőjébe', () => {
    const result = validateWork({ ...valid, siteUrl: 'javascript:alert(1)' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.siteUrl).toBeTruthy();
  });

  it('nem enged külső útvonalat a logó helyére', () => {
    const result = validateWork({ ...valid, logo: 'https://idegen.hu/logo.svg' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.logo).toBeTruthy();
  });

  it('eldobja az ismeretlen típusú blokkot', () => {
    const result = validateWork({
      ...valid,
      blocks: [
        { id: 'a', type: 'lead', text: 'Felvezetés.' },
        { id: 'b', type: 'iframe', src: 'https://idegen.hu' },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.blocks).toHaveLength(1);
      expect(result.value.blocks[0]?.type).toBe('lead');
    }
  });

  it('kiüríti a blokkon belüli külső képhivatkozást', () => {
    const result = validateWork({
      ...valid,
      blocks: [{ id: 'a', type: 'image', image: 'https://idegen.hu/x.png', alt: '', caption: '' }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const block = result.value.blocks[0];
      expect(block?.type).toBe('image');
      if (block?.type === 'image') expect(block.image).toBe('');
    }
  });

  it('felső korlátot szab a blokkok számának', () => {
    const many = Array.from({ length: MAX_WORK_BLOCKS + 10 }, (_, index) => ({
      id: `b${index}`,
      type: 'lead',
      text: 'Szöveg.',
    }));
    const result = validateWork({ ...valid, blocks: many });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.blocks).toHaveLength(MAX_WORK_BLOCKS);
  });
});

describe('validatePartner', () => {
  it('elfogadja a nevet és az oldalon belüli emblémát', () => {
    const result = validatePartner({ name: 'Példa Kft.', logo: '/media/a.svg', url: '', order: 0 });
    expect(result.ok).toBe(true);
  });

  it('embléma nélkül nem megy át', () => {
    const result = validatePartner({ name: 'Példa Kft.', logo: '', url: '', order: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.logo).toBeTruthy();
  });

  it('nem fogad el protokoll-relatív, tehát külső embléma-útvonalat', () => {
    const result = validatePartner({ name: 'Példa', logo: '//idegen.hu/a.svg', url: '', order: 0 });
    expect(result.ok).toBe(false);
  });
});

describe('cleanSettings', () => {
  it('a darabszámot a tartományba szorítja', () => {
    expect(cleanSettings({ works: { count: 99 } }).works.count).toBe(6);
    expect(cleanSettings({ works: { count: -4 } }).works.count).toBe(1);
  });

  it('hiányzó mezőknél az alapértelmezést adja', () => {
    const settings = cleanSettings({});
    expect(settings.partners.enabled).toBe(true);
    expect(settings.works.ids).toEqual([]);
  });

  it('kiszűri az ismétlődő azonosítókat', () => {
    const settings = cleanSettings({ works: { ids: ['a', 'a', 'b'] } });
    expect(settings.works.ids).toEqual(['a', 'b']);
  });
});
