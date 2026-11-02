// Display of record tags. Each tag is a flat theme:tag pair (e.g.
// "standards:NWB") from the vocabulary in schemas/tags.yaml, which reaches the
// build through the generated enums, one per theme. The order themes are
// shown in is the site's choice, so it lives here.

import {
  AnalysisTag,
  ArchiveTag,
  ComputingTag,
  DataManagementTag,
  EngineeringTag,
  LanguageTag,
  MethodTag,
  NeuroscienceTag,
  OrganismTag,
  StandardTag,
} from "./generated/records.ts";
import { escapeHtml } from "./html.ts";

/**
 * Themes in display order. A theme's key, the part of its tags before ":",
 * names its CSS class, tag-<key>, which sets its color.
 */
const THEMES = [
  StandardTag,
  ArchiveTag,
  DataManagementTag,
  OrganismTag,
  MethodTag,
  NeuroscienceTag,
  AnalysisTag,
  EngineeringTag,
  ComputingTag,
  LanguageTag,
] as const;

/** Each tag's position in display order: theme by theme, then as schemas/tags.yaml lists them. */
const RANK: ReadonlyMap<string, number> = new Map(
  THEMES.flatMap((theme): string[] => Object.values(theme)).map((tag, index) => [tag, index]),
);

/** Splits "standards:NWB" into its theme key and tag. */
function splitTag(tag: string): { key: string; name: string } {
  const separator = tag.indexOf(":");
  return { key: tag.slice(0, separator), name: tag.slice(separator + 1) };
}

/** Problems with a record's tags that its schema cannot catch. */
export function checkTags(tags: readonly string[]): string[] {
  // The schema marks tags list_elements_unique, but LinkML's JSON Schema
  // generator does not carry that over as uniqueItems.
  const repeated = [...new Set(tags.filter((tag, index) => tags.indexOf(tag) !== index))].map(
    (tag) => `/tags lists "${tag}" more than once`,
  );
  const themeless = tags
    .filter((tag) => !RANK.has(tag))
    .map((tag) => `/tags "${tag}" belongs to a theme missing from THEMES in src/build/tags.ts`);
  return [...repeated, ...themeless];
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
