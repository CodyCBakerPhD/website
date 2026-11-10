// The sections of the site that are rendered from JSON records: the summary in
// the About section of the home page, then the sections of cards, each on its
// own page under src/ with a search bar above its records.
//
// Each section names the JSON Schema its records are validated against
// (generated from schemas/records.yaml). A section of cards shows its records
// in display order, and lays its cards out in a grid of up to `columns`
// columns, dropping columns where a card would get narrower than
// `minCardWidth` pixels, with a control on the page for choosing between the
// column counts in `choices` (see grid.ts). Order and layout are the site's
// choice rather than properties of the records, so they live in src/build/
// instead of in them. The display order is in display-order.json, which the
// full CV follows too (cv/records.toml), so adding a record file means adding
// its ID to the matching list there. A section's page, icon and label are how
// cards on any page link to its records (see references.ts).

import { datasetSearch, renderDataset } from "./datasets.ts";
import displayOrder from "./display-order.json" with { type: "json" };
import { renderEducation } from "./education.ts";
import { renderPosition } from "./experience.ts";
import type { Dataset, Education, Position, Project, Publication, SkillGroup } from "./generated/records.ts";
import { renderGrid, renderGridControl } from "./grid.ts";
import { checkProject, projectSearch, renderProject } from "./projects.ts";
import { publicationSearch, renderPublications } from "./publications.ts";
import { defineListSection, defineSection } from "./records.ts";
import { renderSearchable, searchId } from "./search.ts";
import { renderSkillGroup } from "./skills.ts";
import { defineSummarySection } from "./summary.ts";

export const sections = [
  // The CVs choose their own summaries from summaries/ in cv/records.toml (see docs/development.md, "CV and resume").
  defineSummarySection({
    name: "summary",
    page: "index.html",
    recordsDir: "summaries",
    schemaFile: "schemas/jsonschema/summary.schema.json",
    show: "general",
  }),
  defineListSection<Education>({
    name: "education",
    page: "index.html",
    recordsDir: "education",
    schemaFile: "schemas/jsonschema/education.schema.json",
    order: displayOrder.education,
    render: (degrees) => degrees.flatMap(renderEducation),
  }),
  defineListSection<SkillGroup>({
    name: "skills",
    page: "index.html",
    recordsDir: "skills",
    schemaFile: "schemas/jsonschema/skill_group.schema.json",
    order: displayOrder.skills,
    render: (groups) => groups.flatMap(renderSkillGroup),
  }),
  defineListSection<Position>({
    name: "experience",
    page: "index.html",
    recordsDir: "experience",
    schemaFile: "schemas/jsonschema/position.schema.json",
    order: displayOrder.experience,
    render: (positions) => positions.flatMap(renderPosition),
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
    order: displayOrder.projects,
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
    order: displayOrder.datasets,
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
    order: displayOrder.publications,
  }),
];
