// Display of record tags. Each tag is a flat theme:tag pair (e.g.
// "standards:NWB") from the Tag enum in schemas/tags.yaml, which lists the
// tags theme by theme, so the generated enum's order is the display order.

import { Tag } from "./generated/records.ts";
import { escapeHtml } from "./html.ts";

const RANK: ReadonlyMap<string, number> = new Map(Object.values(Tag).map((tag, index) => [tag, index]));

/** Splits "standards:NWB" into its theme key and tag. */
function splitTag(tag: string): { key: string; name: string } {
  const separator = tag.indexOf(":");
  return { key: tag.slice(0, separator), name: tag.slice(separator + 1) };
}

/** Problems with a record's tags that its schema cannot catch. */
export function checkTags(tags: readonly string[]): string[] {
  // The schema marks tags list_elements_unique, but LinkML's JSON Schema
  // generator does not carry that over as uniqueItems.
  return [...new Set(tags.filter((tag, index) => tags.indexOf(tag) !== index))].map(
    (tag) => `/tags lists "${tag}" more than once`,
  );
}

/** Renders tags as one row of labels reading "theme | tag", sorted by theme. */
export function renderTags(tags: readonly string[]): string[] {
  const sorted = [...tags].sort((a, b) => (RANK.get(a) ?? RANK.size) - (RANK.get(b) ?? RANK.size));
  return [
    '<li class="tag-list">',
    ...sorted.map((tag) => {
      const { key, name } = splitTag(escapeHtml(tag));
      return `\t<span class="tag tag-${key}"><span class="tag-theme">${key}</span><span class="tag-name">${name}</span></span>`;
    }),
    "</li>",
  ];
}
