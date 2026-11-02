// The sections of index.html that are rendered from JSON records.
//
// Each section names the JSON Schema its records are validated against
// (generated from schemas/records.yaml) and lists its records in display
// order. Order is the site's choice rather than a property of the records, so
// it lives here instead of in them. Adding a record file means adding its ID
// to the matching list below.

import { renderDataset } from "./datasets.ts";
import type { Dataset, Project } from "./generated/records.ts";
import { checkProject, renderProject } from "./projects.ts";
import { defineSection } from "./records.ts";

export const sections = [
  defineSection<Project>({
    name: "projects",
    recordsDir: "projects",
    schemaFile: "schemas/jsonschema/project.schema.json",
    render: renderProject,
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
