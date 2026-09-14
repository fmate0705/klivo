import { describe, expect, it } from 'vitest';
import { slugify, validateContact, validatePost, validateTeamMember } from '@/lib/validation';

describe('slugify', () => {
  it('leszedi a magyar ékezeteket', () => {
    expect(slugify('Árvíztűrő tükörfúrógép')).toBe('arvizturo-tukorfurogep');
  });

  it('nem hagy kötőjelet a széleken', () => {
    expect(slugify('  — Weboldal készítés!  ')).toBe('weboldal-keszites');
  });
});

describe('validateContact', () => {
  const valid = {
    name: 'Kovács Anna',
    email: 'anna@example.hu',
    phone: '+36 30 123 4567',
    company: 'Példa Kft.',
    topic: 'Weboldal készítés',
    message: 'Szeretnénk egy új bemutatkozó oldalt a cégnek.',
  };

  it('elfogad egy helyesen kitöltött űrlapot', () => {
    const result = validateContact(valid);
    expect(result.ok).toBe(true);
  });

  it('kifogásolja a hibás e-mail címet', () => {
    const result = validateContact({ ...valid, email: 'nem-email' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it('kifogásolja a túl rövid üzenetet', () => {
    const result = validateContact({ ...valid, message: 'rövid' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.message).toBeDefined();
  });

  it('ismeretlen témát az utolsó, "Egyéb" értékre cserél', () => {
    const result = validateContact({ ...valid, topic: 'Betörés' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.topic).toBe('Egyéb');
  });
});

describe('validatePost', () => {
  const valid = {
    title: 'Teszt bejegyzés',
    slug: '',
    excerpt: 'Ez egy elég hosszú bevezető a teszthez.',
    body: 'A törzsnek legalább ötven karakter hosszúnak kell lennie, ezért írunk ide eleget.',
    category: 'SEO',
    image: '/images/blog-seo.webp',
    imageAlt: 'Kép',
    author: 'Klivo',
    published: true,
  };

  it('a címből képez slugot, ha nincs megadva', () => {
    const result = validatePost(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.slug).toBe('teszt-bejegyzes');
  });

  it('elutasítja a külső képhivatkozást', () => {
    const result = validatePost({ ...valid, image: 'https://example.com/kep.png' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.image).toBeDefined();
  });

  it('elutasítja a protokoll-relatív képhivatkozást', () => {
    const result = validatePost({ ...valid, image: '//example.com/kep.png' });
    expect(result.ok).toBe(false);
  });
});

describe('validateTeamMember', () => {
  const valid = {
    name: 'Kovács Anna',
    role: 'Fejlesztő',
    bio: '',
    email: '',
    phone: '',
    photo: '',
    order: 0,
  };

  it('elfogadja az elérhetőség nélküli tagot', () => {
    const result = validateTeamMember(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe('');
      expect(result.value.phone).toBe('');
    }
  });

  it('kifogásolja a hibás e-mail címet', () => {
    const result = validateTeamMember({ ...valid, email: 'anna(kukac)klivo.hu' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it('átengedi a kitöltött elérhetőséget', () => {
    const result = validateTeamMember({
      ...valid,
      email: ' anna@klivo.hu ',
      phone: ' +36 30 123 4567 ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe('anna@klivo.hu');
      expect(result.value.phone).toBe('+36 30 123 4567');
    }
  });
});
