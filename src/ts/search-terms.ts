// The record search's query language, apart from the page: how a search splits
// into terms, and how terms and values compare. Nothing here touches the DOM.

/** One term of a search, and where it sits in the search's text. */
export interface Term {
  start: number;
  end: number;
  /** The filter's key, lowercased, or null for free text. */
  key: string | null;
  value: string;
}

/** Lowercases, strips accents (so "rubel" finds "Rübel") and collapses whitespace. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Splits a search into terms at whitespace outside double quotes. Quotes keep a phrase or value together. */
export function parseTerms(query: string): Term[] {
  const terms: Term[] = [];
  let position = 0;
  while (position < query.length) {
    if (/\s/.test(query[position])) {
      position++;
      continue;
    }
    const start = position;
    let quoted = false;
    while (position < query.length && (quoted || !/\s/.test(query[position]))) {
      quoted = query[position] === '"' ? !quoted : quoted;
      position++;
    }
    const raw = query.slice(start, position);
    // A term opening with a quote is literal text, even if it holds a colon.
    const filter = /^([a-z][\w-]*):(.*)$/is.exec(raw);
    terms.push({
      start,
      end: position,
      key: filter ? filter[1].toLowerCase() : null,
      value: (filter ? filter[2] : raw).replace(/"/g, ""),
    });
  }
  return terms;
}

export function formatTerm(key: string, value: string): string {
  return `${key}:${/[\s"]/.test(value) ? `"${value.replace(/"/g, "")}"` : value}`;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

/** The known key a mistyped one most likely meant, if any is close. */
export function closestKey(key: string, keys: readonly string[]): string | undefined {
  const ranked = keys.map((known) => ({ known, distance: editDistance(key, known) })).sort((a, b) => a.distance - b.distance);
  return ranked.length > 0 && ranked[0].distance <= 2 ? ranked[0].known : undefined;
}

/** Whether the years of a record satisfy a year: value such as 2024, >=2023 or <2020. */
export function matchesYear([from, to]: [number, number], comparison: string, year: number): boolean {
  switch (comparison) {
    case ">":
      return to > year;
    case ">=":
      return to >= year;
    case "<":
      return from < year;
    case "<=":
      return from <= year;
    default:
      return from <= year && year <= to;
  }
}

export function compareSortValues(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/** Whether the search's terms include the filter for the tag `theme:name`. */
export function isTagActive(terms: readonly Term[], theme: string, name: string): boolean {
  return terms.some((term) => term.key === theme && normalize(term.value) === normalize(name));
}
