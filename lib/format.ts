/**
 * Locale-aware formatting helpers.
 *
 * Every date rendered on the site goes through here so a server in UTC and a
 * browser in CET never disagree about what a post's publication date says.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Europe/Budapest',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Budapest',
});

/** "2026. augusztus 7." — the form used in article bylines. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return DATE_FORMATTER.format(date);
}

/** "2026. 08. 07. 14:32" — compact form for admin tables. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return DATE_TIME_FORMATTER.format(date);
}

/** Machine-readable value for a `<time datetime>` attribute. */
export function toDateAttribute(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Truncates on a word boundary, appending an ellipsis only when it cut. */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
