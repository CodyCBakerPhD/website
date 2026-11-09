#!/usr/bin/env python3
"""Fetches the GitHub activity that record cards show into
src/build/generated/github.json, so building the site needs no network.

For every pull request or issue a record cites as evidence, it records the
title and, for a pull request, the lines added and deleted. For every
repository a project lists, it records the repository's description. For every
project whose code is on GitHub (its url, and its repositories), it counts the
owner's pull requests merged and issues closed there (those they opened or were
assigned), and the other pull requests they reviewed, each with the search
query that lists them.

Run it after citing a new pull request or issue, or adding a project, and now
and then to refresh the counts. It needs only the standard library. GitHub
answers few requests without a token, so set GITHUB_TOKEN (or GH_TOKEN):

    GITHUB_TOKEN=$(gh auth token) python scripts/fetch_github_activity.py
"""

import datetime
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

OWNER = "CodyCBakerPhD"
ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src" / "build" / "generated" / "github.json"
RECORD_DIRECTORIES = ("projects", "datasets", "publications")

# Keep these in step with src/build/github.ts.
CONTRIBUTION_URL = re.compile(r"^https://github\.com/([^/]+/[^/]+)/(pull|issues)/(\d+)$")
CODE_URL = re.compile(r"^https://github\.com/([^/]+)(?:/([^/]+))?/?$")

TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
# The search API answers 30 requests a minute with a token, and 10 without.
SEARCH_INTERVAL_SECONDS = 2.1 if TOKEN else 6.1


def get(path: str, params: dict[str, str | int] | None = None) -> dict:
    url = f"https://api.github.com/{path}" + (f"?{urllib.parse.urlencode(params)}" if params else "")
    headers = {"Accept": "application/vnd.github+json", "User-Agent": f"{OWNER}-website"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers)) as response:
        return json.load(response)


def count(query: str) -> dict:
    """How many issues or pull requests a search finds, with the query, which GitHub's own search also takes."""
    time.sleep(SEARCH_INTERVAL_SECONDS)
    # Advanced search reads OR and parentheses, and joins any other qualifiers with AND.
    found = get("search/issues", {"q": query, "per_page": 1, "advanced_search": "true"})["total_count"]
    return {"count": found, "query": query}


def fetch_contribution(repository: str, kind: str, number: str) -> dict:
    if kind == "pull":
        pull = get(f"repos/{repository}/pulls/{number}")
        return {
            "type": "pull_request",
            "title": pull["title"],
            "additions": pull["additions"],
            "deletions": pull["deletions"],
        }
    issue = get(f"repos/{repository}/issues/{number}")
    return {"type": "issue", "title": issue["title"]}


def fetch_repository(url: str) -> dict:
    owner, name = CODE_URL.match(url).groups()
    time.sleep(SEARCH_INTERVAL_SECONDS)
    # Repository search leaves forks out unless asked, and a project can be made of one.
    (repository,) = get("search/repositories", {"q": f"repo:{owner}/{name} fork:true"})["items"]
    return {"description": repository["description"]}


def code_query(project: dict) -> str | None:
    """Search qualifiers for where the project's code is on GitHub, or None if it is not."""
    urls = [project["url"], *(repository["url"] for repository in project.get("repositories", []))]
    matches = [match.groups() for match in map(CODE_URL.match, urls) if match]
    organizations = {owner for owner, name in matches if not name}
    qualifiers = [f"org:{owner}" for owner in sorted(organizations)]
    # A repository in an organization the query already covers would only repeat it.
    qualifiers += [f"repo:{owner}/{name}" for owner, name in matches if name and owner not in organizations]
    if len(qualifiers) > 1:
        return f"({' OR '.join(qualifiers)})"
    return qualifiers[0] if qualifiers else None


def main() -> None:
    records = {
        f"{directory}/{file.stem}": json.loads(file.read_text(encoding="utf-8"))
        for directory in RECORD_DIRECTORIES
        for file in sorted((ROOT / directory).glob("*.json"))
    }

    contributions = {}
    for record in records.values():
        for url in record.get("evidence", []):
            match = CONTRIBUTION_URL.match(url)
            if match and url not in contributions:
                contributions[url] = fetch_contribution(*match.groups())
                print(f"{url}: {contributions[url]}")

    repositories = {}
    for record in records.values():
        for repository in record.get("repositories", []):
            url = repository["url"]
            if url not in repositories:
                repositories[url] = fetch_repository(url)
                print(f"{url}: {repositories[url]}")

    projects = {}
    for path, record in records.items():
        scope = code_query(record) if path.startswith("projects/") else None
        if scope:
            # The owner's own work is what they opened or were assigned; reviews are of everyone else's.
            own = f"(author:{OWNER} OR assignee:{OWNER})"
            projects[path] = {
                "merged_pull_requests": count(f"{scope} is:pr is:merged {own}"),
                "reviewed_pull_requests": count(f"{scope} is:pr reviewed-by:{OWNER} -author:{OWNER} -assignee:{OWNER}"),
                "closed_issues": count(f"{scope} is:issue is:closed {own}"),
            }
            print(f"{path}: {projects[path]}")

    activity = {
        "owner": OWNER,
        "fetched": datetime.date.today().isoformat(),
        "projects": projects,
        "repositories": dict(sorted(repositories.items())),
        "contributions": dict(sorted(contributions.items())),
    }
    OUTPUT.write_text(json.dumps(activity, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
