// Display of record tags. The vocabulary, and the theme each tag belongs to,
// come from schemas/tags.yaml through the generated enums; the order themes
// are shown in and their labels are the site's choice, so they live here.

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
 * Themes in display order, each with the label shown before its tags. The label
 * also names the theme's CSS class, tag-<label>, which sets its color.
 */
const THEMES = [
  { label: "standards", tags: StandardTag },
  { label: "archives", tags: ArchiveTag },
  { label: "data", tags: DataManagementTag },
  { label: "organisms", tags: OrganismTag },
  { label: "methods", tags: MethodTag },
  { label: "neuroscience", tags: NeuroscienceTag },
  { label: "analysis", tags: AnalysisTag },
  { label: "engineering", tags: EngineeringTag },
  { label: "computing", tags: ComputingTag },
  { label: "languages", tags: LanguageTag },
] as const;

/** Each tag's theme label, in display order: theme by theme, then as schemas/tags.yaml lists them. */
const THEME_OF: ReadonlyMap<string, string> = new Map(
  THEMES.flatMap(({ label, tags }) => Object.values(tags).map((tag): [string, string] => [tag, label])),
);
const RANK: ReadonlyMap<string, number> = new Map([...THEME_OF.keys()].map((tag, index) => [tag, index]));

/** Problems with a record's tags that its schema cannot catch. */
export function checkTags(tags: readonly string[]): string[] {
  // The schema marks tags list_elements_unique, but LinkML's JSON Schema
  // generator does not carry that over as uniqueItems.
  const repeated = [...new Set(tags.filter((tag, index) => tags.indexOf(tag) !== index))].map(
    (tag) => `/tags lists "${tag}" more than once`,
  );
  const themeless = tags
    .filter((tag) => !THEME_OF.has(tag))
    .map((tag) => `/tags "${tag}" belongs to a theme missing from THEMES in src/build/tags.ts`);
  return [...repeated, ...themeless];
}

/** Renders tags as one row of labels reading "theme | tag", sorted by theme. */
export function renderTags(tags: readonly string[]): string[] {
  const sorted = [...tags].sort((a, b) => (RANK.get(a) ?? RANK.size) - (RANK.get(b) ?? RANK.size));
  return [
    '<li class="tag-list">',
    ...sorted.map((tag) => {
      const theme = THEME_OF.get(tag) ?? "";
      return (
        `\t<span class="tag tag-${theme}">` +
        `<span class="tag-theme">${theme}</span><span class="tag-name">${escapeHtml(tag)}</span></span>`
      );
    }),
    "</li>",
  ];
}
