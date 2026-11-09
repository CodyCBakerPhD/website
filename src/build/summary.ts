// Rendering of summaries/*.json, the professional summaries, for the About
// section of the home page. The CVs render their Summary from the same
// records, so the site shows one of them and says which here.

import type { Summary } from "./generated/records.ts";
import { renderParagraphs } from "./html.ts";
import { invalidRecords, readRecords, type RecordSource, type Section } from "./records.ts";

interface SummarySectionOptions extends RecordSource {
  /** ID (file name without .json) of the summary the section shows. */
  show: string;
}

/** A section showing one summary as paragraphs. Every summary must be valid, shown or not. */
export function defineSummarySection(options: SummarySectionOptions): Section {
  return {
    name: options.name,
    page: options.page,
    watchPaths: [options.recordsDir, options.schemaFile],
    load(root) {
      const { records, problems } = readRecords<Summary>(options, root);
      const summary = records.get(options.show);
      if (!summary && !problems.some((problem) => problem.startsWith(`${options.show}.json:`))) {
        problems.push(`"${options.show}" is the summary src/build/sections.ts shows, but ${options.show}.json does not exist`);
      }
      if (problems.length > 0) {
        throw invalidRecords(options, problems);
      }
      // Summaries name no other records, and no other record names them.
      return { nodes: [], render: () => renderParagraphs(summary!.description) };
    },
  };
}
