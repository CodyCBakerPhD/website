// The sections of the site that are rendered from JSON records, each on its
// own page under src/ with a search bar above its records.
//
// Each section names the JSON Schema its records are validated against
// (generated from schemas/records.yaml) and lists its records in display
// order. Order is the site's choice rather than a property of the records, so
// it lives here instead of in them. Adding a record file means adding its ID
// to the matching list below.

import { renderDataset } from "./datasets.ts";
import type { Dataset, Project, Publication } from "./generated/records.ts";
import { checkProject, renderProject } from "./projects.ts";
import { renderPublications } from "./publications.ts";
import { defineSection } from "./records.ts";
import { renderSearchable } from "./search.ts";

export const sections = [
  defineSection<Project>({
    name: "projects",
    recordsDir: "projects",
    schemaFile: "schemas/jsonschema/project.schema.json",
    render: (projects) => renderSearchable("projects", projects.flatMap(renderProject)),
    check: checkProject,
    order: [
      "nwb-guide",
      "nwb2bids",
      "neuroconv",
      "nwb-inspector",
      "dandi-compute",
      "s3-log-extraction",
      "hearth",
      "historia",
      "neurosift",
      "nwb-benchmarks",
      "duct",
      "hdmf",
      "nwb-widgets",
    ],
  }),
  defineSection<Dataset>({
    name: "datasets",
    recordsDir: "datasets",
    schemaFile: "schemas/jsonschema/dataset.schema.json",
    render: (datasets) => renderSearchable("datasets", datasets.flatMap(renderDataset)),
    order: [
      "visual-coding-ophys",
      "ibl-brain-wide-map",
      "c-elegans-signal-propagation",
      "glia-futility",
      "microns",
      "buzsaki-lab",
    ],
  }),
  defineSection<Publication>({
    name: "publications",
    recordsDir: "publications",
    schemaFile: "schemas/jsonschema/publication.schema.json",
    // Grouped by kind under a heading each; this order applies within a group.
    render: (publications) => renderSearchable("publications", renderPublications(publications)),
    order: [
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
