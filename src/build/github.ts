// GitHub activity shown on record cards: each pull request or issue a record
// cites as evidence, with its title and a pull request's added and deleted
// lines (each taken to have landed, as nearly all have); the repositories a
// project is made of, with their descriptions; and, in each project's code,
// how many of the site owner's pull requests were merged and issues closed
// (those they opened or were assigned), and how many other pull requests they
// reviewed. Records cite only the URL; scripts/fetch_github_activity.py
// fetches the rest into generated/github.json, so building the site needs no
// network.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Repository } from "./generated/records.ts";
import { renderGrid, type CardGrid } from "./grid.ts";
import { displayUrl, escapeHtml, indent } from "./html.ts";
import { renderIcon } from "./icons.ts";

/** Relative to the repository root. */
export const GITHUB_ACTIVITY_FILE = "src/build/generated/github.json";

/** Fewer than this many are few enough to feature one by one; a project with more gets a summary. */
const FEW = 10;

/** Blocks in a pull request's diffstat, as on GitHub. */
const DIFF_BLOCKS = 5;

interface Contribution {
  type: "pull_request" | "issue";
  title: string;
  additions?: number;
  deletions?: number;
}

interface RepositoryActivity {
  description: string | null;
}

/** How many pull requests or issues a GitHub search finds, and the search, which links to them. */
interface SearchCount {
  count: number;
  /** In GitHub's advanced search syntax, e.g. "repo:con/duct is:pr is:merged (author:CodyCBakerPhD OR assignee:CodyCBakerPhD)". */
  query: string;
}

interface ProjectActivity {
  /** The owner's pull requests (opened or assigned) that were merged. */
  merged_pull_requests: SearchCount;
  /** Other pull requests the owner reviewed. */
  reviewed_pull_requests: SearchCount;
  /** The owner's issues (opened or assigned) that were closed. */
  closed_issues: SearchCount;
}

export interface GitHubActivity {
  owner: string;
  /** When it was fetched, as an ISO 8601 date. */
  fetched: string;
  /** Keyed by record path, e.g. "projects/neuroconv". */
  projects: Record<string, ProjectActivity>;
  /** Keyed by the URL of the repository, e.g. "https://github.com/con/duct". */
  repositories: Record<string, RepositoryActivity>;
  /** Keyed by the URL of the pull request or issue. */
  contributions: Record<string, Contribution>;
}

/** A record's slots that point at GitHub, as any record type has them. */
interface GitHubSlots {
  evidence?: readonly string[];
  url?: string;
  repositories?: readonly Repository[];
}

// Keep these in step with scripts/fetch_github_activity.py.
const CONTRIBUTION_URL = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(pull|issues)\/(\d+)$/;
const CODE_URL = /^https:\/\/github\.com\/([^/]+(?:\/[^/]+)?)\/?$/;

const FETCH_COMMAND = "python scripts/fetch_github_activity.py";

export function loadGitHubActivity(root: string): GitHubActivity {
  return JSON.parse(readFileSync(resolve(root, GITHUB_ACTIVITY_FILE), "utf8")) as GitHubActivity;
}

/** Whether evidence is a pull request or issue on GitHub, which cards feature as a contribution. */
export function isContribution(url: string): boolean {
  return CONTRIBUTION_URL.test(url);
}

/**
 * Where a project's code is on GitHub, as lowercase "owner" or "owner/name":
 * its url, when that is on GitHub, and its repositories. Only a project has code.
 */
function codeScopes(path: string, record: GitHubSlots): string[] {
  if (!path.startsWith("projects/")) {
    return [];
  }
  const urls = [record.url ?? "", ...(record.repositories ?? []).map((repository) => repository.url)];
  return urls.flatMap((url) => CODE_URL.exec(url)?.[1].toLowerCase() ?? []);
}

/** The "owner/name" a contribution was made in. */
function repositoryOf(url: string): string {
  return CONTRIBUTION_URL.exec(url)![1];
}

/**
 * The pull requests and issues a record cites, split into those in its own
 * code and those elsewhere that relate to it, such as a change to a standard
 * the project follows. A record without code of its own has only the former.
 */
export function splitContributions(path: string, record: GitHubSlots): { own: string[]; related: string[] } {
  const contributions = (record.evidence ?? []).filter(isContribution);
  const scopes = codeScopes(path, record);
  if (scopes.length === 0) {
    return { own: contributions, related: [] };
  }
  const isOwn = (url: string): boolean => {
    const repository = repositoryOf(url).toLowerCase();
    return scopes.includes(repository) || scopes.includes(repository.split("/")[0]);
  };
  return { own: contributions.filter(isOwn), related: contributions.filter((url) => !isOwn(url)) };
}

/** Problems with a record's GitHub activity, each naming the slot. */
export function checkGitHubActivity(path: string, record: GitHubSlots, activity: GitHubActivity): string[] {
  const problems: string[] = [];
  const { evidence = [], repositories = [] } = record;
  evidence.forEach((source, index) => {
    if (isContribution(source) && !activity.contributions[source]) {
      problems.push(`/evidence/${index} ${source} is missing from ${GITHUB_ACTIVITY_FILE}; run ${FETCH_COMMAND}`);
    }
  });
  const featured = evidence.filter(isContribution).length;
  if (featured >= FEW) {
    problems.push(`/evidence features ${featured} pull requests and issues; feature fewer than ${FEW}`);
  }
  repositories.forEach(({ url }, index) => {
    if (!activity.repositories[url]) {
      problems.push(`/repositories/${index}/url ${url} is missing from ${GITHUB_ACTIVITY_FILE}; run ${FETCH_COMMAND}`);
    }
  });
  if (codeScopes(path, record).length > 0 && !activity.projects[path]) {
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

/**
 * GitHub's diffstat: each side takes its share of the blocks, rounded down, and
 * the rest are neutral. Below that many lines, each line is a block.
 */
function diffBlocks(additions: number, deletions: number): string[] {
  const total = additions + deletions;
  const added = total < DIFF_BLOCKS ? additions : Math.floor((additions * DIFF_BLOCKS) / total);
  const deleted = total < DIFF_BLOCKS ? deletions : Math.floor((deletions * DIFF_BLOCKS) / total);
  return [
    ...Array<string>(added).fill("diff-added"),
    ...Array<string>(deleted).fill("diff-deleted"),
    ...Array<string>(DIFF_BLOCKS - added - deleted).fill("diff-neutral"),
  ];
}

/** The added and deleted lines, as counts beside GitHub's diffstat blocks. */
function renderDiff(additions: number, deletions: number): string {
  const blocks = diffBlocks(additions, deletions).map((block) => `<span class="${block}"></span>`);
  return (
    `<span class="contribution-diff" title="${additions} lines added, ${deletions} deleted">` +
    `<span class="diff-added-count">+${formatCount(additions)}</span> <span class="diff-deleted-count">−${formatCount(deletions)}</span>` +
    `<span class="diff-blocks" aria-hidden="true">${blocks.join("")}</span>` +
    "</span>"
  );
}

function renderContribution(url: string, contribution: Contribution): string[] {
  const [, repository, , number] = CONTRIBUTION_URL.exec(url)!;
  return [
    '<div class="contribution">',
    ...indent([
      // A long repository name is cut short, rather than the number it precedes.
      `<span class="contribution-meta">` +
        `<span class="visually-hidden">${contribution.type === "pull_request" ? "Pull request" : "Issue"} </span>` +
        `<span class="contribution-repository" title="${escapeHtml(repository)}">${escapeHtml(repository)}</span>` +
        `<span class="contribution-number">#${number}</span>` +
        "</span>",
      `<a class="contribution-title" href="${escapeHtml(url)}">${escapeHtml(contribution.title)}</a>`,
      ...(contribution.type === "pull_request" ? [renderDiff(contribution.additions ?? 0, contribution.deletions ?? 0)] : []),
    ]),
    "</div>",
  ];
}

/** Subcards for pull requests and issues a record cites, or null if there are none. */
export function renderContributions(urls: readonly string[], activity: GitHubActivity): string | null {
  if (urls.length === 0) {
    return null;
  }
  const cards = urls.flatMap((url) => renderContribution(url, activity.contributions[url]));
  return ['<div class="contributions">', ...indent(cards), "</div>"].join("\n");
}

/**
 * Subcards for repositories a project is made of, each with its logo and
 * description, laid out in the mini grid `grid`, or null if there are none. A
 * repository is named by its own name and links to its code, unless it has a
 * homepage, such as the web app it serves: then it is named by that website's
 * title and links there.
 */
export function renderRepositories(
  repositories: readonly Repository[],
  activity: GitHubActivity,
  grid: CardGrid,
): string | null {
  if (repositories.length === 0) {
    return null;
  }
  const cards = repositories.flatMap(({ url, logo, homepage, title }) => {
    const [, fullName] = CODE_URL.exec(url)!;
    const name = title ?? fullName.split("/")[1];
    const { description } = activity.repositories[url];
    const mark = logo
      ? `<img class="repository-logo" src="${escapeHtml(logo)}" alt="" />`
      : `<span class="repository-logo">${renderIcon("repository")}</span>`;
    return [
      '<div class="repository">',
      ...indent([
        mark,
        '<span class="repository-text">',
        ...indent([
          `<a class="repository-name" href="${escapeHtml(homepage ?? url)}" title="${escapeHtml(homepage ? displayUrl(homepage) : fullName)}">${escapeHtml(name)}</a>`,
          ...(description ? [`<span class="repository-description">${escapeHtml(description)}</span>`] : []),
        ]),
        "</span>",
      ]),
      "</div>",
    ];
  });
  return renderGrid(grid, cards, "subcards").join("\n");
}

/**
 * Tiles counting a project's merged pull requests, reviewed pull requests and
 * closed issues, each linking to the search that lists them, or null while
 * the owner's own work there is few enough to feature one by one instead.
 * Reviews of others' work do not count toward that, and a count of zero gets no tile.
 */
export function renderActivitySummary(path: string, activity: GitHubActivity): string | null {
  const project = activity.projects[path];
  if (!project || (project.merged_pull_requests.count < FEW && project.closed_issues.count < FEW)) {
    return null;
  }
  // Each with GitHub's icon for it, colored as the stylesheet colors its kind.
  const tiles = [
    { kind: "merged", icon: "pull-request-merged", label: "Pull requests merged", search: project.merged_pull_requests, type: "pullrequests" },
    { kind: "reviewed", icon: "code-review", label: "Pull requests reviewed", search: project.reviewed_pull_requests, type: "pullrequests" },
    { kind: "closed", icon: "issue-closed", label: "Issues closed", search: project.closed_issues, type: "issues" },
  ] as const;
  return [
    '<div class="activity">',
    ...indent(
      tiles
        .filter(({ search }) => search.count > 0)
        .map(
          ({ kind, icon, label, search, type }) =>
            `<a class="activity-stat activity-${kind}" href="${escapeHtml(searchUrl(search.query, type))}">` +
            `<span class="activity-value"><span class="activity-icon">${renderIcon(icon)}</span>${formatCount(search.count)}</span>` +
            `<span class="activity-label">${label}</span></a>`,
        ),
    ),
    "</div>",
  ].join("\n");
}
