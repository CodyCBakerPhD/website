// The search bar above a page's records. The markup and the data it searches
// are static; the browser does the searching (src/ts/search.ts), finding its
// parts by the data-search* attributes set here, the cards by
// data-search-item (see renderCard) and the tags by data-tag (see renderTags).
//
// A search is free text plus key:value filters, after DANDI's search: every
// tag theme is a filter key (standards:NWB), and so are the fields each
// section lists below.

import { TagTheme } from "./generated/records.ts";
import { escapeHtml, indent } from "./html.ts";

/** A filter on one of a record's fields, matching any of its values by substring. */
export interface FieldFilter<T> {
  key: string;
  description: string;
  values: (record: T) => readonly string[];
}

/** An order the records can be shown in, besides the order sections.ts lists them in. */
export interface SortOrder<T> {
  id: string;
  label: string;
  /** Compared as text (numbers in it by value), so ISO dates sort by date. */
  value: (record: T) => string;
  descending?: boolean;
}

export interface SearchConfig<T> {
  /** The records, in the plural, as the search bar names them. */
  noun: string;
  filters: readonly FieldFilter<T>[];
  /** First and last year of the work (null while ongoing), for the year: filter. */
  years?: (record: T) => readonly [number, number | null];
  sorts: readonly SortOrder<T>[];
}

/** Keys that are not fields: the tag themes, any tag, and the years. */
const RESERVED_KEYS = new Set<string>([...Object.values(TagTheme), "tag", "year"]);

/** Each tag theme's key and name, e.g. "standards" and "Data standards". */
const THEMES = Object.entries(TagTheme).map(([name, key]) => ({ key, description: name.replace(/_/g, " ") }));

/** First year of a partial ISO date such as "2023-03". */
export function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

/** The data the browser searches and sorts a record's card by, as a data attribute. */
export function searchAttribute<T>(config: SearchConfig<T>, record: T): string {
  const data = {
    fields: Object.fromEntries(config.filters.map((filter) => [filter.key, filter.values(record)])),
    years: config.years?.(record) ?? null,
    sort: Object.fromEntries(config.sorts.map((sort) => [sort.id, sort.value(record)])),
  };
  return `data-search-record="${escapeHtml(JSON.stringify(data))}"`;
}

/** The ID the search bar's elements derive their own IDs from. */
export function searchId<T>(config: SearchConfig<T>): string {
  return config.noun.replace(/\W+/g, "-");
}

/**
 * Wraps a section's rendered records with a search bar that searches and sorts them, followed by
 * any `controls` of the section's own, such as how many columns to show.
 */
export function renderSearchable<T>(config: SearchConfig<T>, records: readonly string[], controls: readonly string[] = []): string[] {
  const clash = config.filters.find((filter) => RESERVED_KEYS.has(filter.key));
  if (clash) {
    throw new Error(`The "${clash.key}:" filter of the ${config.noun} search clashes with a tag theme or built-in filter`);
  }

  const id = searchId(config);
  const label = escapeHtml(`Search ${config.noun}`);
  const settings = {
    noun: config.noun,
    filters: [
      ...config.filters.map(({ key, description }) => ({ key, description, kind: "field" })),
      ...(config.years ? [{ key: "year", description: "Year of the work, or a range such as year:>=2023", kind: "year" }] : []),
      { key: "tag", description: "Any tag, whatever its theme", kind: "tag" },
      ...THEMES.map(({ key, description }) => ({ key, description, kind: "theme" })),
    ],
    sorts: [{ id: "featured", label: "Featured" }, ...config.sorts.map(({ id, label, descending }) => ({ id, label, descending }))],
  };
  const sortOptions = settings.sorts.map(({ id: value, label: text }) => `<option value="${escapeHtml(value)}">${escapeHtml(text)}</option>`);

  const form = [
    `<form class="record-search" role="search" data-search-form data-search-config="${escapeHtml(JSON.stringify(settings))}">`,
    ...indent([
      '<div class="record-search-controls">',
      ...indent([
        '<div class="record-search-field">',
        ...indent([
          '<i class="fa fa-search" aria-hidden="true"></i>',
          `<input type="search" name="q" placeholder="${label}" aria-label="${label}" autocomplete="off" spellcheck="false"` +
            ` role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-suggestions" data-search-input>`,
          // Out of the tab order (as a scrolling box it would be in it), since the arrow keys move through it.
          `<ul class="record-search-suggestions" id="${id}-suggestions" role="listbox" aria-label="Suggestions" tabindex="-1" hidden data-search-suggestions></ul>`,
        ]),
        "</div>",
        '<label class="record-search-sort">',
        ...indent([
          "<span>Sort by</span>",
          '<span class="record-search-select">',
          ...indent(['<select name="sort" data-search-sort>', ...indent(sortOptions), "</select>"]),
          "</span>",
        ]),
        "</label>",
        ...controls,
      ]),
      "</div>",
      // Announces the result count to screen readers; sighted readers see the cards themselves.
      '<p class="visually-hidden" role="status" data-search-status></p>',
    ]),
    "</form>",
  ];
  const empty = '<p class="record-search-empty" data-search-empty hidden></p>';
  return [`<div class="record-search-scope" data-search>`, ...indent([...form, empty, ...records]), "</div>"];
}
