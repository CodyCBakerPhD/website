// The sections of index.html that are rendered from JSON records.
//
// Each section pins the schema version this site renders and lists its records
// in display order. Order is the site's choice rather than a property of the
// records, so it lives here instead of in them. Adding a record file means
// adding its ID to the matching list below.

import { renderDataset, type Dataset } from "./datasets.ts";
import { checkProject, renderProject, type Project } from "./projects.ts";
import { defineSection } from "./records.ts";

export const sections = [
  defineSection<Project>({
    name: "projects",
    recordsDir: "projects",
    schemaFile: "schemas/project/0.1.0.schema.json",
    render: renderProject,
    check: checkProject,
    order: [
      "nwb-guide",
      "nwb2bids",
      "neuroconv",
      "nwb-inspector",
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
    schemaFile: "schemas/dataset/0.1.0.schema.json",
    render: renderDataset,
    order: [
      "visual-coding-ophys",
      "ibl-brain-wide-map",
      "c-elegans-signal-propagation",
      "glia-futility",
      "microns",
      "buzsaki-lab",
    ],
  }),
];
