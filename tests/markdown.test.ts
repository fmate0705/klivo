import { describe, expect, it } from 'vitest';
import { markdownToPlainText, renderMarkdown } from '@/lib/markdown';

describe('renderMarkdown', () => {
  it('a szerző szövegéből soha nem lesz HTML tag', () => {
    const html = renderMarkdown('<script>alert(1)</script> és <b>félkövér</b>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('a címsorokból h2 és h3 lesz', () => {
    expect(renderMarkdown('## Cím')).toBe('<h2>Cím</h2>');
    expect(renderMarkdown('### Alcím')).toBe('<h3>Alcím</h3>');
  });

  it('a felsorolásokat listává alakítja', () => {
    expect(renderMarkdown('- egy\n- kettő')).toBe('<ul><li>egy</li><li>kettő</li></ul>');
    expect(renderMarkdown('1. egy\n2. kettő')).toBe('<ol><li>egy</li><li>kettő</li></ol>');
  });

  it('a kódrészletben nem formáz félkövérré semmit', () => {
    expect(renderMarkdown('`**nem félkövér**`')).toContain('<code>**nem félkövér**</code>');
  });

  it('a nem biztonságos linkeket sima szöveggé fokozza le', () => {
    const html = renderMarkdown('[kattints](javascript:alert(1))');
    expect(html).not.toContain('href="javascript');
    expect(html).toContain('kattints');
  });

  it('a külső linkre rel="noopener noreferrer" kerül', () => {
    const html = renderMarkdown('[oldal](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('a belső link nem nyílik új ablakban', () => {
    const html = renderMarkdown('[szolgáltatások](/szolgaltatasok)');
    expect(html).toContain('href="/szolgaltatasok"');
    expect(html).not.toContain('target="_blank"');
  });
});

describe('markdownToPlainText', () => {
  it('eltávolítja a jelöléseket', () => {
    expect(markdownToPlainText('## Cím\n\n**Vastag** és *dőlt*.')).toBe('Cím Vastag és dőlt.');
  });
});
