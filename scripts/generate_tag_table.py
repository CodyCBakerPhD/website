"""Writes the tag table in docs/development.md from the vocabulary in schemas/tags.yaml.

Run by scripts/generate-schemas.sh. Fails if the tags slot and the theme enums
in schemas/tags.yaml disagree, or if a tag is listed under more than one theme.
"""

import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
VOCABULARY = ROOT / "schemas" / "tags.yaml"
DOC = ROOT / "docs" / "development.md"
START = "<!-- tags:start -->"
END = "<!-- tags:end -->"


def rows() -> list[tuple[str, str, str]]:
    schema = yaml.safe_load(VOCABULARY.read_text())
    enums = schema["enums"]
    themes = [entry["range"] for entry in schema["slots"]["tags"]["any_of"]]
    if sorted(themes) != sorted(enums):
        sys.exit(f"{VOCABULARY}: the tags slot's any_of must list each theme enum exactly once")

    theme_of: dict[str, str] = {}
    table = []
    for theme in themes:
        for index, (tag, value) in enumerate(enums[theme]["permissible_values"].items()):
            if tag in theme_of:
                sys.exit(f"{VOCABULARY}: {tag!r} is listed under both {theme_of[tag]} and {theme}")
            theme_of[tag] = theme
            # The theme is named on its first row only, so the groups stand out.
            table.append((enums[theme]["title"] if index == 0 else "", f"`{tag}`", value["description"]))
    return table


def markdown(table: list[tuple[str, str, str]]) -> str:
    header = ("Theme", "Tag", "Meaning")
    widths = [max(len(row[i]) for row in [header, *table]) for i in range(3)]
    line = lambda cells: "| " + " | ".join(cell.ljust(width) for cell, width in zip(cells, widths)) + " |"
    return "\n".join([line(header), "|" + "|".join("-" * (width + 2) for width in widths) + "|", *map(line, table)])


def main() -> None:
    text = DOC.read_text()
    block = re.compile(re.escape(START) + ".*?" + re.escape(END), re.DOTALL)
    if not block.search(text):
        sys.exit(f"{DOC} is missing the {START} ... {END} markers")
    generated = f"{START}\n{markdown(rows())}\n{END}"
    DOC.write_text(block.sub(lambda _: generated, text, count=1))


if __name__ == "__main__":
    main()
