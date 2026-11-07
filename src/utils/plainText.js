const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  times: '×',
  middot: '·',
};

/**
 * Decode the numeric and named HTML entities that WordPress emits in
 * excerpts, so cards never render "didn&#8217;t" as literal text.
 */
export function decodeEntities(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name] ?? match);
}

export function stripHtml(html = '') {
  return decodeEntities(String(html).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(text = '', maxLength = 120) {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).replace(/\s+\S*$/, '')}…`;
}
