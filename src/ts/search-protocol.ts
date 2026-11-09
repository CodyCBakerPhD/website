// What the build tells the browser's search, as the JSON of two attributes:
// data-search-config on the search form (Settings) and data-search-record on
// each card (RecordData). The build (src/build/search.ts) writes them and the
// browser (search.ts) reads them, both against these types, so a change to
// either side that the other does not follow fails npm run typecheck. Types
// only, and no DOM, so the build can import it too.

export type FilterKind = "field" | "year" | "tag" | "theme";

export interface Filter {
  key: string;
  description: string;
  kind: FilterKind;
}

export interface SortOrder {
  id: string;
  label: string;
  descending?: boolean;
}

export interface Settings {
  noun: string;
  filters: readonly Filter[];
  sorts: readonly SortOrder[];
}

export interface RecordData {
  /** Each field filter's values for the record, keyed by the filter's key. */
  fields: Record<string, readonly string[]>;
  /** First and last year of the work (null while ongoing), or null without a year: filter. */
  years: readonly [number, number | null] | null;
  /** The record's value for each sort order, keyed by the order's id. */
  sort: Record<string, string>;
}
