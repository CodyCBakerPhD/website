// GitHub activity shown on record cards: each pull request or issue a record
// cites as evidence, with its title, its state and a pull request's added and
// deleted lines; the repositories a project is made of, with their
// descriptions; and how many pull requests and issues the site's owner has had
// merged and closed in each project's code. Records cite only the URL;
// scripts/fetch_github_activity.py fetches the rest into generated/github.json,
// so building the site needs no network.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { escapeHtml, indent } from "./html.ts";
import { renderIcon, type IconName } from "./icons.ts";

/** Relative to the repository root. */
export const GITHUB_ACTIVITY_FILE = "src/build/generated/github.json";

/** Fewer than this many are few enough to feature one by one; a project with more gets a summary. */
const FEW = 10;

/** Blocks in a pull request's diffstat, as on GitHub. */
const DIFF_BLOCKS = 5;

interface Contribution {
  type: "pull_request" | "issue";
  title: string;
  state: "merged" | "open" | "closed";
  additions?: number;
  deletions?: number;
}

interface Repository {
  description: string | null;
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
  /** Keyed by the URL of the repository, e.g. "https://github.com/con/duct". */
  repositories: Record<string, Repository>;
  /** Keyed by the URL of the pull request or issue. */
  contributions: Record<string, Contribution>;
}

/** A record's slots that point at GitHub, as any record type has them. */
interface GitHubSlots {
  evidence?: readonly string[];
  url?: string;
  repositories?: readonly { url: string; logo?: string; homepage?: string }[];
}

// Keep these in step with scripts/fetch_github_activity.py.
const CONTRIBUTION_URL = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(pull|issues)\/(\d+)$/;
const CODE_URL = /^https:\/\/github\.com\/([^/]+(?:\/[^/]+)?)\/?$/;

interface State {
  label: string;
  icon: IconName;
  /** GitHub's color for it, named as the stylesheet names it: green, purple or red. */
  color: "open" | "done" | "closed";
}

/**
 * GitHub's label for each state, with its icon and color. The activity does
 * not say why an issue was closed, so every closed issue is shown as completed,
 * which is how most are closed. Issues are never merged.
 */
const STATES: Readonly<Record<Contribution["type"], Readonly<Partial<Record<Contribution["state"], State>>>>> = {
  pull_request: {
    open: { label: "Open", icon: "pull-request-open", color: "open" },
    merged: { label: "Merged", icon: "pull-request-merged", color: "done" },
    closed: { label: "Closed", icon: "pull-request-closed", color: "closed" },
  },
  issue: {
    open: { label: "Open", icon: "issue-open", color: "open" },
    closed: { label: "Closed", icon: "issue-closed", color: "done" },
  },
};

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

/** GitHub's state label: a pill in the state's color, with its icon. */
function renderState(contribution: Contribution): string {
  const { label, icon, color } = STATES[contribution.type][contribution.state]!;
  const kind = contribution.type === "pull_request" ? "pull request" : "issue";
  return (
    `<span class="contribution-state state-${color}">${renderIcon(icon, "state-icon")}` +
    `${label}<span class="visually-hidden"> ${kind}</span></span>`
  );
}

function renderContribution(url: string, contribution: Contribution): string[] {
  const [, repository, , number] = CONTRIBUTION_URL.exec(url)!;
  return [
    '<div class="contribution">',
    ...indent([
      // A long repository name is cut short, rather than the number it precedes.
      `<span class="contribution-meta">` +
        `<span class="contribution-repository" title="${escapeHtml(repository)}">${escapeHtml(repository)}</span>` +
        `<span class="contribution-number">#${number}</span>` +
        renderState(contribution) +
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
 * Subcards for the repositories a project is made of, each with its logo and
 * description, or null if it lists none. Each links to the repository, or to
 * its homepage when the record gives one, such as the web app it serves.
 */
export function renderRepositories(repositories: GitHubSlots["repositories"], activity: GitHubActivity): string | null {
  if (!repositories?.length) {
    return null;
  }
  const cards = repositories.flatMap(({ url, logo, homepage }) => {
    const [, fullName] = CODE_URL.exec(url)!;
    const name = fullName.split("/")[1];
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
          `<a class="repository-name" href="${escapeHtml(homepage ?? url)}" title="${escapeHtml(homepage ?? fullName)}">${escapeHtml(name)}</a>`,
          ...(description ? [`<span class="repository-description">${escapeHtml(description)}</span>`] : []),
        ]),
        "</span>",
      ]),
      "</div>",
    ];
  });
  return ['<div class="repositories">', ...indent(cards), "</div>"].join("\n");
}

/** Tiles counting a project's merged pull requests and closed issues, or null if few enough to feature instead. */
export function renderActivitySummary(path: string, activity: GitHubActivity): string | null {
  const project = activity.projects[path];
  if (!project || (project.merged_pull_requests < FEW && project.closed_issues < FEW)) {
    return null;
  }
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
  ].join("\n");
}
