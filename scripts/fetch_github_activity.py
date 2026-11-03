#!/usr/bin/env python3
"""Fetches the GitHub activity that record cards show into
src/build/generated/github.json, so building the site needs no network.

For every pull request or issue a record cites as evidence, it records the
title and state and, for a pull request, the lines added and deleted. For every project
whose code is on GitHub (its url, or its repositories), it counts the owner's
merged pull requests and closed issues there.

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


def count(query: str) -> int:
    time.sleep(SEARCH_INTERVAL_SECONDS)
    return get("search/issues", {"q": query, "per_page": 1})["total_count"]


def fetch_contribution(repository: str, kind: str, number: str) -> dict:
    if kind == "pull":
        pull = get(f"repos/{repository}/pulls/{number}")
        return {
            "type": "pull_request",
            "title": pull["title"],
            "state": "merged" if pull["merged_at"] else pull["state"],
            "additions": pull["additions"],
            "deletions": pull["deletions"],
        }
    issue = get(f"repos/{repository}/issues/{number}")
    return {"type": "issue", "title": issue["title"], "state": issue["state"]}


def code_query(project: dict) -> str | None:
    """Search qualifiers for where the project's code is on GitHub, or None if it is not."""
    qualifiers = []
    for url in project.get("repositories") or [project["url"]]:
        match = CODE_URL.match(url)
        if match:
            qualifiers.append(f"repo:{match[1]}/{match[2]}" if match[2] else f"org:{match[1]}")
    return " ".join(qualifiers) or None


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

    projects = {}
    for path, record in records.items():
        scope = code_query(record) if path.startswith("projects/") else None
        if scope:
            query = f"{scope} author:{OWNER}"
            projects[path] = {
                "query": query,
                "merged_pull_requests": count(f"{query} is:pr is:merged"),
                "closed_issues": count(f"{query} is:issue is:closed"),
            }
            print(f"{path}: {projects[path]}")

    activity = {
        "owner": OWNER,
        "fetched": datetime.date.today().isoformat(),
        "projects": projects,
        "contributions": dict(sorted(contributions.items())),
    }
    OUTPUT.write_text(json.dumps(activity, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
