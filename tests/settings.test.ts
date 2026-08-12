import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, PRICE_FIELDS, PRICE_KEYS, priceOf } from '@/lib/store/prices';
import {
  CONTACT_FIELDS,
  COMPANY_FIELDS,
  ORGANIZATION_FIELDS,
  defaultOrganization,
  emailHref,
  phoneHref,
} from '@/lib/store/organization';
import { services } from '@/lib/site';

describe('árbeállítások', () => {
  it('minden árkulcshoz tartozik alapértelmezett érték', () => {
    for (const key of PRICE_KEYS) {
      expect(DEFAULT_SETTINGS.prices[key]).toBeTruthy();
    }
  });

  it('minden árkulcs szerkeszthető az adminban', () => {
    const editable = new Set(PRICE_FIELDS.map((field) => field.key));
    for (const key of PRICE_KEYS) {
      expect(editable.has(key)).toBe(true);
    }
  });

  it('a szolgáltatások és az ársávok csak létező árkulcsra hivatkoznak', () => {
    const known = new Set<string>(PRICE_KEYS);
    for (const service of services) {
      expect(known.has(service.priceKey)).toBe(true);
      for (const tier of service.pricing.tiers ?? []) {
        expect(known.has(tier.priceKey)).toBe(true);
      }
    }
  });

  it('hiányzó érték esetén az alapértelmezettre esik vissza', () => {
    const broken = { prices: {} as Record<string, string> };
    expect(priceOf(broken as never, 'websiteFrom')).toBe(DEFAULT_SETTINGS.prices.websiteFrom);
  });
});

describe('cégadatok', () => {
  it('minden mezőhöz van kezdőérték', () => {
    const organization = defaultOrganization();
    for (const field of ORGANIZATION_FIELDS) {
      const group = field.group === 'contact' ? organization.contact : organization.company;
      expect((group as Record<string, string>)[field.key]).toBeTruthy();
    }
  });

  it('a mezőlista lefedi az összes tárolt kulcsot', () => {
    const organization = defaultOrganization();
    const contactKeys = new Set(CONTACT_FIELDS.map((field) => field.key));
    const companyKeys = new Set(COMPANY_FIELDS.map((field) => field.key));

    for (const key of Object.keys(organization.contact)) expect(contactKeys.has(key)).toBe(true);
    for (const key of Object.keys(organization.company)) expect(companyKeys.has(key)).toBe(true);
  });

  it('a környezeti változó felülírja a helyőrzőt', () => {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'iroda@pelda.hu';
    expect(defaultOrganization().contact.email).toBe('iroda@pelda.hu');
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  });

  it('üres környezeti változó nem üríti ki a mezőt', () => {
    process.env.CONTACT_HOURS = '   ';
    expect(defaultOrganization().contact.hours.trim().length).toBeGreaterThan(0);
    delete process.env.CONTACT_HOURS;
  });

  it('a hívható link a szóközök nélküli számot tartalmazza', () => {
    expect(phoneHref('+36 30 123 4567')).toBe('tel:+36301234567');
    expect(phoneHref('06-30-123-4567')).toBe('tel:06301234567');
  });

  it('az e-mail link mailto előtaggal készül', () => {
    expect(emailHref('hello@klivo.hu')).toBe('mailto:hello@klivo.hu');
  });
});
