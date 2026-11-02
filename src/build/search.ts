// The search bar above a page's records. The markup is static; the browser
// does the filtering (src/ts/search.ts), finding its parts by the data-search*
// attributes set here, the cards by data-search-item (see renderCard) and the
// tags by data-tag (see renderTags).

import { escapeHtml, indent } from "./html.ts";

/** Wraps a section's rendered records with a search bar that filters them. `noun` names them in the plural. */
export function renderSearchable(noun: string, records: readonly string[]): string[] {
  const label = escapeHtml(`Search ${noun}`);
  const form = [
    '<form class="record-search" role="search" data-search-form>',
    ...indent([
      '<div class="record-search-field">',
      ...indent([
        '<i class="fa fa-search" aria-hidden="true"></i>',
        `<input type="search" name="q" placeholder="${label}" aria-label="${label}" autocomplete="off" spellcheck="false" data-search-input>`,
      ]),
      "</div>",
      '<div class="record-search-summary">',
      ...indent([
        '<p class="record-search-status" role="status" data-search-status></p>',
        '<div class="record-search-tags" data-search-tags></div>',
        '<button type="button" class="record-search-clear" data-search-clear hidden>Clear filters</button>',
      ]),
      "</div>",
    ]),
    "</form>",
  ];
  return [`<div class="record-search-scope" data-search="${escapeHtml(noun)}">`, ...indent([...form, ...records]), "</div>"];
}
