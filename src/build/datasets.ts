// Rendering of datasets/*.json for the "Data Curation" section.

import type { Dataset } from "./generated/records.ts";
import { escapeHtml, indent, renderLinks, renderParagraphs, SEPARATOR } from "./html.ts";
import { renderTags } from "./tags.ts";

/** Link labels, in the order the links are shown. */
const LINK_LABELS = {
  manuscript: "Manuscript",
  dataset: "Dataset",
  notebook: "Jupyter Notebook",
  code: "Conversion Code",
} as const;

export function renderDataset(dataset: Dataset): string[] {
  const details = [
    `Group: ${dataset.group}`,
    ...(dataset.institution ? [`Location: ${dataset.institution}`] : []),
    `Modality: ${dataset.modality}`,
    `Role: ${dataset.role}`,
  ];
  const lines = [`<h3>${escapeHtml(dataset.name)}</h3>`, `<li>${details.map(escapeHtml).join(SEPARATOR)}</li>`];

  const links = renderLinks(dataset.links, LINK_LABELS);
  if (links.length > 0) {
    lines.push(...links, "<br>");
  }

  lines.push(...renderParagraphs(dataset.description), ...renderTags(dataset.tags));
  return ['<ul class="work-list">', ...indent(lines), "</ul>"];
}
