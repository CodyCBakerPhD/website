// Rendering of datasets/*.json for the "Data Curation" section.

import type { Dataset } from "./generated/records.ts";
import { escapeHtml, renderCard, renderLinks, renderParagraphs, SEPARATOR } from "./html.ts";
import type { RecordEntry } from "./records.ts";
import { searchAttribute, type SearchConfig } from "./search.ts";
import { renderTags } from "./tags.ts";

/** Link labels, in the order the links are shown. */
const LINK_LABELS = {
  manuscript: "Manuscript",
  dataset: "Dataset",
  notebook: "Jupyter Notebook",
  code: "Conversion Code",
} as const;

// Each record is a data curation project, which may have published several datasets.
export const datasetSearch: SearchConfig<Dataset> = {
  noun: "data curation projects",
  filters: [
    { key: "name", description: "Name of the data curation project", values: (dataset) => [dataset.name] },
    { key: "group", description: "Research group whose data it is", values: (dataset) => [dataset.group] },
    { key: "institution", description: "Institution of that group", values: (dataset) => (dataset.institution ? [dataset.institution] : []) },
    { key: "modality", description: "Modality of the data", values: (dataset) => [dataset.modality] },
    { key: "role", description: "Role in the curation", values: (dataset) => [dataset.role] },
  ],
  sorts: [
    { id: "name", label: "Name (A–Z)", value: (dataset) => dataset.name },
    { id: "group", label: "Group (A–Z)", value: (dataset) => dataset.group },
  ],
};

export function renderDataset({ id, record: dataset, references }: RecordEntry<Dataset>): string[] {
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

  lines.push(...renderParagraphs(dataset.description), ...references, ...renderTags(dataset.tags));
  return renderCard(lines, searchAttribute(datasetSearch, dataset), id, dataset.name);
}
