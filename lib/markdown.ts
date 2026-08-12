/**
 * A deliberately small Markdown renderer for blog post bodies.
 *
 * Why not `marked` / `remark`: the only author is the site owner, the supported
 * syntax is fixed, and a full CommonMark implementation plus a sanitiser is a
 * large dependency surface for a feature this narrow. Fewer moving parts also
 * means the security property below is verifiable by reading one file.
 *
 * **The security property.** Every piece of input text is HTML-escaped *before*
 * any markup is produced, and the generated tags are drawn from a fixed
 * vocabulary. There is no path by which author input becomes an HTML tag, so
 * pasted `<script>` renders as visible text. If you extend this module, keep
 * that ordering: escape first, then build markup. `tests/markdown.test.ts`
 * locks the behaviour down.
 *
 * Supported syntax:
 *   ## Heading            h2
 *   ### Heading           h3
 *   > quote               blockquote
 *   - item / 1. item      ul / ol
 *   ```code```            pre > code
 *   ---                   hr
 *   **bold** *italic*     strong / em
 *   `code`                inline code
 *   [text](href)          link (http/https/mailto/tel or site-relative only)
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Only allows schemes that cannot execute script. `javascript:` and `data:`
 * are the two that matter and both are rejected here.
 */
function isSafeHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (value.startsWith('#')) return true;
  return (
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:')
  );
}

/**
 * Placeholder marker for extracted code spans.
 *
 * U+0000 is used because it cannot survive in the input: it is not valid in an
 * HTML text node, and any that somehow arrived would have been consumed by the
 * escaping pass that runs first. Built from a char code rather than written
 * literally so the source stays pure ASCII — a literal control character is
 * invisible in a diff and easily destroyed by an editor.
 */
const SENTINEL = String.fromCharCode(0);
const PLACEHOLDER = new RegExp(`${SENTINEL}(\\d+)${SENTINEL}`, 'g');

/**
 * Inline formatting. Runs on already-escaped text, so the angle brackets it
 * emits are the only ones in the output.
 */
function renderInline(escaped: string): string {
  // Inline code is lifted out before anything else runs, and put back at the
  // very end. Replacing it in place is not enough: the later bold/italic passes
  // would still see the text *inside* the `<code>` element and format it, so
  // an inline code span containing asterisks would render bold instead of
  // showing the asterisks — which is exactly what code spans exist to prevent.
  const codeSpans: string[] = [];
  const withPlaceholders = escaped.replace(/`([^`]+)`/g, (_match, code: string) => {
    codeSpans.push(code);
    return `${SENTINEL}${codeSpans.length - 1}${SENTINEL}`;
  });

  const formatted = withPlaceholders
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, text: string, href: string) => {
      // The href arrives escaped; &amp; must be restored before validation.
      const candidate = href.replace(/&amp;/g, '&').replace(/&#39;/g, "'");
      if (!isSafeHref(candidate)) return text;

      const external = /^https?:\/\//i.test(candidate);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${attrs}>${text}</a>`;
    });

  return formatted.replace(
    PLACEHOLDER,
    (_match, index: string) => `<code>${codeSpans[Number(index)] ?? ''}</code>`,
  );
}

type Block = { type: 'ul' | 'ol'; items: string[] } | null;

/** Renders a Markdown body to an HTML string. */
export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];

  let list: Block = null;
  let paragraph: string[] = [];
  let codeLines: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${renderInline(escapeHtml(paragraph.join(' ')))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const items = list.items.map((item) => `<li>${renderInline(escapeHtml(item))}</li>`).join('');
    html.push(`<${list.type}>${items}</${list.type}>`);
    list = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Fenced code — everything inside is escaped and otherwise untouched.
    if (line.trimStart().startsWith('```')) {
      if (codeLines === null) {
        flushAll();
        codeLines = [];
      } else {
        html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = null;
      }
      continue;
    }
    if (codeLines !== null) {
      codeLines.push(rawLine);
      continue;
    }

    if (line.trim() === '') {
      flushAll();
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      flushAll();
      html.push('<hr />');
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = (heading[1] as string).length;
      html.push(`<h${level}>${renderInline(escapeHtml(heading[2] as string))}</h${level}>`);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flushAll();
      html.push(`<blockquote><p>${renderInline(escapeHtml(quote[1] as string))}</p></blockquote>`);
      continue;
    }

    const unordered = /^[-*]\s+(.*)$/.exec(line);
    if (unordered) {
      flushParagraph();
      if (list?.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(unordered[1] as string);
      continue;
    }

    const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (list?.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(ordered[1] as string);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  // An unterminated fence still has to produce its content.
  if (codeLines !== null) {
    html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }
  flushAll();

  return html.join('\n');
}

/** Plain-text projection, used for meta descriptions and reading estimates. */
export function markdownToPlainText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*\s]+/gm, '')
    .replace(/[*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
