// Display of record tags. Each tag is a flat theme:tag pair (e.g.
// "standards:NWB") from the Tag enum in schemas/tags.yaml, which lists the
// tags theme by theme, so the generated enum's order is the display order.

import { Tag } from "./generated/records.ts";
import { escapeHtml } from "./html.ts";
import { duplicates } from "./lists.ts";

const RANK: ReadonlyMap<string, number> = new Map(Object.values(Tag).map((tag, index) => [tag, index]));

/** Splits "standards:NWB" into its theme key and tag. */
function splitTag(tag: string): { key: string; name: string } {
  const separator = tag.indexOf(":");
  return { key: tag.slice(0, separator), name: tag.slice(separator + 1) };
}

/** Problems with a record's tags that its schema cannot catch. */
export function checkTags(tags: readonly string[]): string[] {
  return duplicates(tags).map((tag) => `/tags lists "${tag}" more than once`);
}

/**
 * Renders tags as one row of labels reading "theme | tag", sorted by theme.
 * Each label is a toggle button the page's search (src/ts/search.ts) filters by.
 */
export function renderTags(tags: readonly string[]): string[] {
  const sorted = [...tags].sort((a, b) => (RANK.get(a) ?? RANK.size) - (RANK.get(b) ?? RANK.size));
  return [
    '<div class="card-line tag-list">',
    ...sorted.map((tag) => {
      const escaped = escapeHtml(tag);
      const { key, name } = splitTag(escaped);
      // The space between the halves is not rendered (the label is a flex box),
      // but keeps them apart in the text the search matches against.
      return (
        `\t<button type="button" class="tag tag-${key}" data-tag="${escaped}" aria-pressed="false">` +
        `<span class="tag-theme">${key}</span> <span class="tag-name">${name}</span></button>`
      );
    }),
    "</div>",
  ];
}
