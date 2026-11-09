// The sections of the site that are rendered from JSON records: the summary in
// the About section of the home page, then the sections of cards, each on its
// own page under src/ with a search bar above its records.
//
// Each section names the JSON Schema its records are validated against
// (generated from schemas/records.yaml). A section of cards lists its records
// in display order, and lays its cards out in a grid of up to `columns`
// columns, dropping columns where a card would get narrower than
// `minCardWidth` pixels, with a control on the page for choosing between the
// column counts in `choices` (see grid.ts). Order and layout are the site's choice
// rather than properties of the records, so they live here instead of in
// them. Adding a record file means
// adding its ID to the matching list below. Its page, icon and label are how
// cards on any page link to its records (see references.ts).

import { datasetSearch, renderDataset } from "./datasets.ts";
import type { Dataset, Project, Publication } from "./generated/records.ts";
import { renderGrid, renderGridControl } from "./grid.ts";
import { checkProject, projectSearch, renderProject } from "./projects.ts";
import { publicationSearch, renderPublications } from "./publications.ts";
import { defineSection } from "./records.ts";
import { renderSearchable, searchId } from "./search.ts";
import { defineSummarySection } from "./summary.ts";

export const sections = [
  // The CVs choose their own summaries from summaries/ (see the job-applications repository).
  defineSummarySection({
    name: "summary",
    page: "index.html",
    recordsDir: "summaries",
    schemaFile: "schemas/jsonschema/summary.schema.json",
    show: "general",
  }),
  defineSection<Project>({
    name: "projects",
    page: "projects.html",
    icon: "fa-cube",
    related: "Featured software",
    recordsDir: "projects",
    schemaFile: "schemas/jsonschema/project.schema.json",
    grid: { columns: 3, minCardWidth: 420, choices: [1, 2, 3, 4] },
    render: (projects, grid) =>
      renderSearchable(projectSearch, renderGrid(grid, projects.flatMap(renderProject)), renderGridControl(grid, searchId(projectSearch))),
    check: checkProject,
    order: [
      "hearth",
      "ember-archive",
      "dandi-archive",
      "s3-log-extraction",
      "nwb-guide",
      "neuroconv",
      "neurosift",
      "nwb-benchmarks",
      "dandi-compute",
      "dandi-cache",
      "stamped",
      "nwb-inspector",
      "historia",
      "nwb2bids",
      "hdmf",
      "nwb-widgets",
      "duct",
    ],
  }),
  defineSection<Dataset>({
    name: "datasets",
    page: "data-curation.html",
    icon: "fa-database",
    related: "Featured data",
    recordsDir: "datasets",
    schemaFile: "schemas/jsonschema/dataset.schema.json",
    grid: { columns: 3, minCardWidth: 420, choices: [1, 2, 3, 4] },
    render: (datasets, grid) =>
      renderSearchable(datasetSearch, renderGrid(grid, datasets.flatMap(renderDataset)), renderGridControl(grid, searchId(datasetSearch))),
    order: [
      "visual-coding-ophys",
      "ibl-brain-wide-map",
      "c-elegans-signal-propagation",
      "glia-futility",
      "odor-sequences-hippocampus",
      "microns",
      "multi-object-working-memory",
      "reaching-population-dynamics",
      "buzsaki-lab",
      "polymer-probe-recordings",
    ],
  }),
  defineSection<Publication>({
    name: "publications",
    page: "publications.html",
    icon: "fa-file-text-o",
    related: "Featured publications",
    // Two workshops share a title, so links to publications also name the year.
    label: (publication) => `${publication.name} (${publication.date.slice(0, 4)})`,
    recordsDir: "publications",
    schemaFile: "schemas/jsonschema/publication.schema.json",
    grid: { columns: 2, minCardWidth: 420, choices: [1, 2, 3, 4] },
    // Grouped by kind under a heading each, with a grid each; this order applies within a group.
    render: (publications, grid) =>
      renderSearchable(publicationSearch, renderPublications(publications, grid), renderGridControl(grid, searchId(publicationSearch))),
    order: [
      "stamped-2026",
      "open-data-in-neurophysiology-2025",
      "dandi-2025",
      "remote-access-methods-2025",
      "neuroconv-2025",
      "neurosift-2024",
      "biccn-data-ecosystem-2023",
      "synaptic-connectivity-inference-2020",
      "nonlinear-stimulus-representations-2020",
      "correlated-states-2019",
      "nwb-guide-sfn-2024",
      "neuroconv-sfn-2023",
      "semi-balanced-networks-cosyne-2020",
      "connectivity-inference-cosyne-2018",
      "nwb-dandi-tutorial-baylor-2024",
      "neuroconv-nwb-guide-tutorial-janelia-2023",
      "nwb-dandi-tutorial-cosyne-2023",
      "nwb-dandi-hackathon-swc-2023",
      "neuroinformatics-odin-2023",
      "neuroconv-tutorial-janelia-2022",
    ],
  }),
];
