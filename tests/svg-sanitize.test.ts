import { describe, expect, it } from 'vitest';
import { sanitizeSvg } from '@/lib/svg-sanitize';

/**
 * A partner emblémák SVG-ben érkeznek, és az SVG dokumentum, nem kép: azonos
 * originről kiszolgálva egy rosszindulatú fájl tárolt XSS lenne. Ez a fájl
 * rögzíti, hogy a fertőtlenítő engedélyezőlistával dolgozik — amit nem ismer
 * fel, az nem kerül a kimenetbe.
 *
 * Ha valaki bővíti a modult, ezeknek a teszteknek zölden kell maradniuk.
 */

/** Segéd: a fertőtlenített kimenet, vagy dobás, ha a fájlt elutasítottuk. */
function clean(source: string): string {
  const result = sanitizeSvg(source);
  if (!result.ok) throw new Error(result.error);
  return result.svg;
}

describe('sanitizeSvg', () => {
  it('megtartja a szokásos embléma-elemeket', () => {
    const svg = clean(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z" fill="#0D4F8F"/></svg>',
    );
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('<path');
    expect(svg).toContain('fill="#0D4F8F"');
  });

  it('kidobja a szkriptet és a tartalmát is', () => {
    const svg = clean('<svg><script>alert(1)</script><circle r="4"/></svg>');
    expect(svg).not.toContain('script');
    expect(svg).not.toContain('alert');
    expect(svg).toContain('<circle');
  });

  it('kidobja az eseménykezelőket', () => {
    const svg = clean('<svg onload="alert(1)"><rect onclick="steal()" width="4"/></svg>');
    expect(svg).not.toContain('onload');
    expect(svg).not.toContain('onclick');
    expect(svg).not.toContain('alert');
    expect(svg).toContain('width="4"');
  });

  it('kidobja a beágyazott HTML-t (foreignObject)', () => {
    const svg = clean(
      '<svg><foreignObject><iframe src="https://idegen.hu"></iframe></foreignObject></svg>',
    );
    expect(svg).not.toContain('foreignObject');
    expect(svg).not.toContain('iframe');
    expect(svg).not.toContain('idegen.hu');
  });

  it('nem enged külső erőforrást betölteni', () => {
    const svg = clean(
      '<svg><image href="https://idegen.hu/kovetes.png"/><use href="https://idegen.hu/x#a"/></svg>',
    );
    expect(svg).not.toContain('idegen.hu');
  });

  it('a dokumentumon belüli hivatkozást megtartja', () => {
    const svg = clean('<svg><use href="#jel"/></svg>');
    expect(svg).toContain('href="#jel"');
  });

  it('kidobja a külső kérést indító inline stílust', () => {
    const svg = clean(
      '<svg><rect style="fill:url(https://idegen.hu/a.png)"/><circle style="fill:#fff"/></svg>',
    );
    expect(svg).not.toContain('idegen.hu');
    expect(svg).toContain('style="fill:#fff"');
  });

  it('a saját színátmenetére mutató kitöltést megtartja', () => {
    const svg = clean(
      '<svg><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs><rect fill="url(#g)"/></svg>',
    );
    expect(svg).toContain('fill="url(#g)"');
    expect(svg).toContain('<linearGradient id="g">');
  });

  it('kidobja a kifelé mutató kitöltést', () => {
    const svg = clean('<svg><rect fill="url(https://idegen.hu/a.svg#g)"/></svg>');
    expect(svg).not.toContain('idegen.hu');
  });

  it('elutasítja a doctype-ot és az entitásdeklarációt', () => {
    const withEntity = sanitizeSvg('<!DOCTYPE svg [<!ENTITY a "b">]><svg><rect/></svg>');
    expect(withEntity.ok).toBe(false);
  });

  it('elutasítja azt, ami nem SVG', () => {
    expect(sanitizeSvg('<html><body>szia</body></html>').ok).toBe(false);
  });

  it('a szövegtartalomból nem lehet markup', () => {
    const svg = clean('<svg><text>&lt;script&gt;alert(1)&lt;/script&gt;</text></svg>');
    expect(svg).not.toContain('<script');
  });

  it('a megjegyzésbe rejtett tag sem jut át', () => {
    const svg = clean('<svg><!-- <script>alert(1)</script> --><rect width="2"/></svg>');
    expect(svg).not.toContain('script');
    expect(svg).toContain('<rect');
  });

  it('a lezáratlan elemeket bezárja', () => {
    const svg = clean('<svg><g><rect width="2"/>');
    expect(svg).toBe('<svg><g><rect width="2"/></g></svg>');
  });
});
