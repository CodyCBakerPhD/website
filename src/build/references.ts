// Links between records, and the evidence a record cites from outside the
// site. A record names another by the path of its file without .json, such as
// "projects/neuroconv", in one of the relation slots of schemas/records.yaml.
// Only the record making a link names it: its card lists the link under the
// relation's label, and the card of the record it names lists it in reverse,
// so the two cards always agree. Evidence that is a pull request or issue on
// GitHub is featured as a contribution (see github.ts); the rest is listed as
// sources.

import type { BaseRecord } from "./generated/records.ts";
import {
  checkGitHubActivity,
  isContribution,
  renderActivitySummary,
  renderFeaturedContributions,
  type GitHubActivity,
} from "./github.ts";
import { escapeHtml, indent } from "./html.ts";

/**
 * The relation slots of schemas/records.yaml, in the order cards list them. A
 * null label heads each named record by its type instead, e.g. "Featured software".
 */
const RELATIONS = [
  { slot: "about", label: null, reverse: "Presented in" },
  { slot: "built_with", label: "Related software", reverse: "Used by" },
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
  /** Heading over links to it from a record about it, e.g. "Featured software". */
  related: string;
  record: LinkingRecord;
}

interface Group {
  label: string;
  /** HTML of the group's <dd>. */
  body: string;
  /** Class of its <dd>. */
  kind: "record-links" | "record-activity" | "record-contributions";
}

/** Links laid side by side in one <dd>, wrapping when the row is full. */
function linkGroup(label: string, links: readonly string[]): Group {
  return { label, kind: "record-links", body: links.map((link) => `<span class="record-link">${link}</span>`).join("\n") };
}

// Each link is wrapped, so it stays inline and is underlined line by line when it wraps.
function renderRecordLink(node: RecordNode): string {
  return `<i class="fa fa-fw ${node.icon}" aria-hidden="true"></i> <span><a href="${escapeHtml(node.href)}">${escapeHtml(node.label)}</a></span>`;
}

/** "pypi.org/project/historia" for https://pypi.org/project/historia/. */
function displayUrl(url: string): string {
  const { host, pathname, search } = new URL(url);
  return `${host.replace(/^www\./, "")}${pathname.replace(/\/$/, "")}${search}`;
}

// A source other than a pull request or issue is shown by its address: nothing about it is fetched.
function renderSourceLink(url: string): string {
  return `<i class="fa fa-fw fa-external-link" aria-hidden="true"></i> <span><a href="${escapeHtml(url)}">${escapeHtml(displayUrl(url))}</a></span>`;
}

/** Linked records under a heading each: the relation's label, or else each record's own heading. */
function headed(label: string | null, linked: readonly RecordNode[]): [string, RecordNode[]][] {
  const groups = new Map<string, RecordNode[]>();
  for (const node of linked) {
    const heading = label ?? node.related;
    groups.set(heading, [...(groups.get(heading) ?? []), node]);
  }
  return [...groups];
}

/** One block per card listing its links under their labels, or nothing if it has none. */
function renderGroups(groups: readonly Group[]): string[] {
  if (groups.length === 0) {
    return [];
  }
  const rows = groups.flatMap(({ label, body, kind }) => [
    "<div>",
    ...indent([`<dt>${escapeHtml(label)}</dt>`, `<dd class="${kind}">`, ...indent([body]), "</dd>"]),
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
  const urls = node.record.evidence ?? [];
  for (const url of new Set(urls.filter((url, index) => urls.indexOf(url) !== index))) {
    problems.push(`/evidence cites ${url} more than once`);
  }
  return problems;
}

/**
 * Checks every record's links and GitHub activity, and renders, for each
 * record's path, the lines its card lists them in: a summary of its GitHub
 * activity, its featured contributions, each relation in both directions, then
 * its other sources. Problems are prefixed with the record's file.
 */
export function linkRecords(
  nodes: readonly RecordNode[],
  activity: GitHubActivity,
): { problems: string[]; references: Map<string, string[]> } {
  const byPath = new Map(nodes.map((node) => [node.path, node]));
  const problems = nodes.flatMap((node) =>
    [...checkNode(node, byPath), ...checkGitHubActivity(node.path, node.record, activity)].map(
      (problem) => `${node.path}.json: ${problem}`,
    ),
  );
  if (problems.length > 0) {
    return { problems, references: new Map() };
  }

  const references = new Map<string, string[]>();
  for (const node of nodes) {
    const evidence = node.record.evidence ?? [];
    const groups: Group[] = [];
    const summary = renderActivitySummary(node.path, activity);
    if (summary) {
      groups.push({ label: "Contributions", kind: "record-activity", body: summary });
    }
    const featured = renderFeaturedContributions(evidence, activity);
    if (featured) {
      groups.push({ label: "Featured contributions", kind: "record-contributions", body: featured });
    }
    for (const { slot, label, reverse } of RELATIONS) {
      const targets = [...new Set(node.record[slot] ?? [])].flatMap((target) => byPath.get(target) ?? []);
      const sources = nodes.filter((source) => source.record[slot]?.includes(node.path) && source !== node);
      for (const [heading, linked] of [...headed(label, targets), ...headed(reverse, sources)]) {
        groups.push(linkGroup(heading, linked.map(renderRecordLink)));
      }
    }
    const sources = evidence.filter((item) => !isContribution(item));
    if (sources.length > 0) {
      groups.push(linkGroup("Sources", sources.map(renderSourceLink)));
    }
    references.set(node.path, renderGroups(groups));
  }
  return { problems, references };
}
