// Links between records, and the evidence a record cites from outside the
// site. A record names another by the path of its file without .json, such as
// "projects/neuroconv", in one of the relation slots of schemas/records.yaml.
// Only the record making a link names it: its card lists the link under the
// relation's label, and the card of the record it names lists it in reverse,
// so the two cards always agree.

import type { BaseRecord, Evidence } from "./generated/records.ts";
import { escapeHtml, indent } from "./html.ts";

/** The relation slots of schemas/records.yaml, in the order cards list them. */
const RELATIONS = [
  { slot: "about", label: "About", reverse: "Featured in" },
  { slot: "built_with", label: "Built with", reverse: "Used by" },
  { slot: "replaced_by", label: "Replaced by", reverse: "Replaces" },
] as const;

type RelationSlot = (typeof RELATIONS)[number]["slot"];

/** A record as any record type has it: the relation slots are on some types only. */
type LinkingRecord = BaseRecord & Partial<Record<RelationSlot, readonly string[]>>;

/** A record as the other records see it. */
export interface RecordNode {
  /** The path of its file from the repository root without .json, e.g. "projects/neuroconv". */
  path: string;
  /** Where its card is, e.g. "projects.html#neuroconv". */
  href: string;
  /** Text of a link to it. */
  label: string;
  /** Font Awesome icon marking links to records of its type. */
  icon: string;
  record: LinkingRecord;
}

interface Group {
  label: string;
  links: string[];
}

// Each link is wrapped, so it stays inline and is underlined line by line when it wraps.
function renderRecordLink(node: RecordNode): string {
  return `<i class="fa fa-fw ${node.icon}" aria-hidden="true"></i> <span><a href="${escapeHtml(node.href)}">${escapeHtml(node.label)}</a></span>`;
}

function renderEvidenceLink(evidence: Evidence): string {
  return `<i class="fa fa-fw fa-external-link" aria-hidden="true"></i> <span><a href="${escapeHtml(evidence.url)}">${escapeHtml(evidence.title)}</a></span>`;
}

/** One block per card listing its links under their labels, or nothing if it has none. */
function renderGroups(groups: readonly Group[]): string[] {
  if (groups.length === 0) {
    return [];
  }
  const rows = groups.flatMap(({ label, links }) => [
    "<div>",
    ...indent([`<dt>${escapeHtml(label)}</dt>`, ...links.map((link) => `<dd>${link}</dd>`)]),
    "</div>",
  ]);
  return ['<li class="record-references">', ...indent(["<dl>", ...indent(rows), "</dl>"]), "</li>"];
}

/** Problems with the record's links and evidence that its schema cannot catch, each naming the slot. */
function checkNode(node: RecordNode, nodes: ReadonlyMap<string, RecordNode>): string[] {
  const problems: string[] = [];
  for (const { slot } of RELATIONS) {
    const targets = node.record[slot] ?? [];
    targets.forEach((target, index) => {
      if (target === node.path) {
        problems.push(`/${slot}/${index} names the record itself`);
      } else if (!nodes.has(target)) {
        problems.push(`/${slot}/${index} names "${target}", but ${target}.json does not exist`);
      } else if (targets.indexOf(target) !== index) {
        problems.push(`/${slot} names "${target}" more than once`);
      }
    });
  }
  const urls = (node.record.evidence ?? []).map((evidence) => evidence.url);
  for (const url of new Set(urls.filter((url, index) => urls.indexOf(url) !== index))) {
    problems.push(`/evidence cites ${url} more than once`);
  }
  return problems;
}

/**
 * Checks every record's links and renders, for each record's path, the lines
 * its card lists them in: each relation in both directions, then its evidence.
 * Problems are prefixed with the record's file.
 */
export function linkRecords(nodes: readonly RecordNode[]): { problems: string[]; references: Map<string, string[]> } {
  const byPath = new Map(nodes.map((node) => [node.path, node]));
  const problems = nodes.flatMap((node) => checkNode(node, byPath).map((problem) => `${node.path}.json: ${problem}`));

  const references = new Map<string, string[]>();
  for (const node of nodes) {
    const groups: Group[] = [];
    for (const { slot, label, reverse } of RELATIONS) {
      const targets = [...new Set(node.record[slot] ?? [])].flatMap((target) => byPath.get(target) ?? []);
      const sources = nodes.filter((source) => source.record[slot]?.includes(node.path) && source !== node);
      for (const [heading, linked] of [
        [label, targets],
        [reverse, sources],
      ] as const) {
        if (linked.length > 0) {
          groups.push({ label: heading, links: linked.map(renderRecordLink) });
        }
      }
    }
    if (node.record.evidence) {
      groups.push({ label: "Evidence", links: node.record.evidence.map(renderEvidenceLink) });
    }
    references.set(node.path, renderGroups(groups));
  }
  return { problems, references };
}
