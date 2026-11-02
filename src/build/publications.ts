// Rendering of publications/*.json for the "Publications" section.

import type { Publication } from "./generated/records.ts";
import { PublicationKind } from "./generated/records.ts";
import { escapeHtml, indent, renderCard, renderParagraphs } from "./html.ts";
import { renderTags } from "./tags.ts";

/** The site owner's name as it appears in author lists, shown in bold. */
const OWNER = "C. Baker";

/** Heading for each kind of publication, in the order the groups are shown. */
const KIND_HEADINGS: Readonly<Record<PublicationKind, string>> = {
  [PublicationKind.article]: "Journal Articles",
  [PublicationKind.presentation]: "Conference Presentations",
  [PublicationKind.workshop]: "Workshops",
};

/** "A", "A and B", "A, B, and C", or "A, B, et al." when the list is abbreviated. */
function formatAuthors(authors: readonly string[], etAl: boolean): string {
  const names = authors.map((author) => (author === OWNER ? `<strong>${escapeHtml(author)}</strong>` : escapeHtml(author)));
  if (etAl) {
    return `${names.join(", ")}, et al.`;
  }
  if (names.length <= 2) {
    return names.join(" and ");
  }
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/** Ends a citation part with a period, unless it already ends a sentence. */
function sentence(text: string): string {
  return /[.?!]$/.test(text) ? text : `${text}.`;
}

function renderPublication(publication: Publication): string[] {
  const citation = [
    `${formatAuthors(publication.authors, publication.et_al ?? false)} (${escapeHtml(publication.date.slice(0, 4))}).`,
    `<em>${escapeHtml(sentence(publication.name))}</em>`,
    escapeHtml(sentence(publication.venue)) + (publication.note ? ` ${escapeHtml(sentence(publication.note))}` : ""),
    ...(publication.doi ? [`<a href="${escapeHtml(publication.doi)}">DOI</a>`] : []),
  ];
  const lines = ["<li>", ...indent(citation), "</li>"];
  if (publication.description) {
    lines.push("<br>", ...renderParagraphs(publication.description));
  }
  lines.push(...renderTags(publication.tags));
  return renderCard(lines);
}

/**
 * Groups publications under a heading per kind, keeping the display order within each group.
 * Each group is its own element so the search can hide a heading whose publications are all filtered out.
 */
export function renderPublications(publications: readonly Publication[]): string[] {
  const groups = Object.entries(KIND_HEADINGS)
    .map(([kind, heading]) => ({ heading, members: publications.filter((publication) => publication.kind === kind) }))
    .filter(({ members }) => members.length > 0);
  return groups.flatMap(({ heading, members }) => [
    '<div class="record-group" data-search-group>',
    ...indent([`<h2>${heading}</h2>`, ...members.flatMap(renderPublication)]),
    "</div>",
  ]);
}
