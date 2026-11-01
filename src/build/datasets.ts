// Rendering of datasets/*.json for the "Data Curation" section.

import { escapeHtml, indent, renderParagraphs, SEPARATOR } from "./html.ts";

/** A record in datasets/, as described by schemas/dataset/0.1.0.schema.json. */
export interface Dataset {
  schemaVersion: "0.1.0";
  name: string;
  group: string;
  institution?: string;
  modality: string;
  role: string;
  links?: {
    manuscript?: string;
    dataset?: string;
    notebook?: string;
    code?: string;
  };
  description: string[];
}

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

  const links = (Object.keys(LINK_LABELS) as (keyof typeof LINK_LABELS)[]).flatMap((key) => {
    const url = dataset.links?.[key];
    return url ? [`<a href="${escapeHtml(url)}">${LINK_LABELS[key]}</a>`] : [];
  });
  if (links.length > 0) {
    lines.push(links.join(`${SEPARATOR.trimEnd()}\n`), "<br>");
  }

  lines.push(...renderParagraphs(dataset.description));
  return ['<ul class="work-list">', ...indent(lines), "</ul>"];
}
