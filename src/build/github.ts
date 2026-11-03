// GitHub activity shown on record cards: each pull request or issue a record
// cites as evidence, with its state and a pull request's added and deleted
// lines, and how many pull requests and issues the site's owner has had merged
// and closed in each project's code. scripts/fetch_github_activity.py fetches
// it into generated/github.json, so building the site needs no network.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Evidence } from "./generated/records.ts";
import { escapeHtml, indent } from "./html.ts";

/** Relative to the repository root. */
export const GITHUB_ACTIVITY_FILE = "src/build/generated/github.json";

/** Fewer than this many are few enough to feature one by one; a project with more gets a summary. */
const FEW = 10;

interface Contribution {
  type: "pull_request" | "issue";
  state: "merged" | "open" | "closed";
  additions?: number;
  deletions?: number;
}

interface ProjectActivity {
  /** GitHub search qualifiers for the project's code and its author, e.g. "repo:con/duct author:CodyCBakerPhD". */
  query: string;
  merged_pull_requests: number;
  closed_issues: number;
}

export interface GitHubActivity {
  owner: string;
  /** When it was fetched, as an ISO 8601 date. */
  fetched: string;
  /** Keyed by record path, e.g. "projects/neuroconv". */
  projects: Record<string, ProjectActivity>;
  /** Keyed by the URL of the pull request or issue. */
  contributions: Record<string, Contribution>;
}

// Keep these in step with scripts/fetch_github_activity.py.
const CONTRIBUTION_URL = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(pull|issues)\/(\d+)$/;
const CODE_URL = /^https:\/\/github\.com\/[^/]+(\/[^/]+)?\/?$/;

const STATES: Readonly<Record<Contribution["state"], string>> = { merged: "Merged", open: "Open", closed: "Closed" };

const FETCH_COMMAND = "python scripts/fetch_github_activity.py";

export function loadGitHubActivity(root: string): GitHubActivity {
  return JSON.parse(readFileSync(resolve(root, GITHUB_ACTIVITY_FILE), "utf8")) as GitHubActivity;
}

/** Whether evidence is a pull request or issue on GitHub, which cards feature as a contribution. */
export function isContribution(evidence: Evidence): boolean {
  return CONTRIBUTION_URL.test(evidence.url);
}

/** Problems with a record's GitHub activity, each naming the slot. */
export function checkGitHubActivity(path: string, record: object, activity: GitHubActivity): string[] {
  const problems: string[] = [];
  const { evidence = [], url, repositories } = record as { evidence?: Evidence[]; url?: string; repositories?: string[] };
  evidence.forEach((item, index) => {
    if (isContribution(item) && !activity.contributions[item.url]) {
      problems.push(`/evidence/${index} ${item.url} is missing from ${GITHUB_ACTIVITY_FILE}; run ${FETCH_COMMAND}`);
    }
  });
  const featured = evidence.filter(isContribution).length;
  if (featured >= FEW) {
    problems.push(`/evidence features ${featured} pull requests and issues; feature fewer than ${FEW}`);
  }
  const codeOnGitHub = Boolean(repositories?.length) || (path.startsWith("projects/") && CODE_URL.test(url ?? ""));
  if (codeOnGitHub && !activity.projects[path]) {
    problems.push(`its code is on GitHub, but ${GITHUB_ACTIVITY_FILE} has no counts for it; run ${FETCH_COMMAND}`);
  }
  return problems;
}

/** 1,284 below ten thousand, then 12.9K. */
function formatCount(count: number): string {
  return count < 10_000
    ? count.toLocaleString("en-US")
    : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);
}

function searchUrl(query: string, type: "pullrequests" | "issues"): string {
  return `https://github.com/search?${new URLSearchParams({ q: query, type })}`;
}

/** The added and deleted lines, as counts beside a bar split between them. */
function renderDiff(additions: number, deletions: number): string {
  const parts = [
    ["diff-added", additions],
    ["diff-deleted", deletions],
  ] as const;
  // A part at zero draws nothing.
  const bar = parts
    .filter(([, lines]) => lines > 0)
    .map(([part, lines]) => `<span class="${part}" style="flex-grow: ${lines}"></span>`)
    .join("");
  return (
    `<span class="contribution-diff" title="${additions} lines added, ${deletions} deleted">` +
    `<span>+${formatCount(additions)}</span> <span>−${formatCount(deletions)}</span>` +
    (bar ? `<span class="diff-bar" aria-hidden="true">${bar}</span>` : "") +
    "</span>"
  );
}

function renderContribution(evidence: Evidence, contribution: Contribution): string[] {
  const [, repository, , number] = CONTRIBUTION_URL.exec(evidence.url)!;
  const isPull = contribution.type === "pull_request";
  const kind = isPull ? "Pull request" : "Issue";
  return [
    '<div class="contribution">',
    ...indent([
      // A long repository name is cut short, rather than the number it precedes.
      `<span class="contribution-meta"><i class="fa ${isPull ? "fa-code-fork" : "fa-dot-circle-o"}" aria-hidden="true"></i>` +
        `<span class="visually-hidden">${kind}</span>` +
        `<span class="contribution-repository" title="${escapeHtml(repository)}">${escapeHtml(repository)}</span>` +
        `<span class="contribution-number">#${number}</span>` +
        `<span class="contribution-state">${STATES[contribution.state]}</span></span>`,
      `<a class="contribution-title" href="${escapeHtml(evidence.url)}">${escapeHtml(evidence.title)}</a>`,
      ...(isPull ? [renderDiff(contribution.additions ?? 0, contribution.deletions ?? 0)] : []),
    ]),
    "</div>",
  ];
}

/** Subcards for the pull requests and issues a record features, or null if it features none. */
export function renderFeaturedContributions(evidence: readonly Evidence[], activity: GitHubActivity): string | null {
  const featured = evidence.filter(isContribution);
  if (featured.length === 0) {
    return null;
  }
  const cards = featured.flatMap((item) => renderContribution(item, activity.contributions[item.url]));
  return ['<div class="contributions">', ...indent(cards), "</div>"].join("\n");
}

/** Tiles counting a project's merged pull requests and closed issues, or null if few enough to feature instead. */
export function renderActivitySummary(path: string, activity: GitHubActivity): string | null {
  const project = activity.projects[path];
  if (!project || (project.merged_pull_requests < FEW && project.closed_issues < FEW)) {
    return null;
  }
  const asOf = new Date(`${activity.fetched}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const tile = (count: number, label: string, href: string): string =>
    `<a class="activity-stat" href="${escapeHtml(href)}"><span class="activity-value">${formatCount(count)}</span>` +
    `<span class="activity-label">${label}</span></a>`;
  return [
    '<div class="activity">',
    ...indent([
      tile(project.merged_pull_requests, "Pull requests merged", searchUrl(`${project.query} is:pr is:merged`, "pullrequests")),
      tile(project.closed_issues, "Issues closed", searchUrl(`${project.query} is:issue is:closed`, "issues")),
    ]),
    "</div>",
    `<span class="activity-date">On GitHub, as of ${asOf}</span>`,
  ].join("\n");
}
