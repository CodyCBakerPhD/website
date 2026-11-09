"""Writes the tag table in docs/development.md from the vocabulary in schemas/tags.yaml.

Run by scripts/generate-schemas.sh. Fails unless every tag is a theme:tag pair
whose key is a theme in TagTheme, with the tags listed theme by theme in the
order of TagTheme and every theme having at least one tag.
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
    enums = yaml.safe_load(VOCABULARY.read_text())["enums"]
    themes = enums["TagTheme"]["permissible_values"]
    tags = enums["Tag"]["permissible_values"]

    keys = []
    for tag in tags:
        key = tag.split(":", 1)[0] if ":" in tag else None
        if key not in themes:
            sys.exit(f"{VOCABULARY}: {tag!r} is not a theme:tag pair whose key is listed in TagTheme")
        keys.append(key)
    # Collapsing runs of the same key must give TagTheme's order exactly once each.
    runs = [key for index, key in enumerate(keys) if index == 0 or keys[index - 1] != key]
    if runs != list(themes):
        sys.exit(
            f"{VOCABULARY}: Tag must list its tags theme by theme, in the order of TagTheme, with every theme used"
        )

    table = []
    for index, (tag, value) in enumerate(tags.items()):
        # The theme is named on its first row only, so the groups stand out.
        first = index == 0 or keys[index - 1] != keys[index]
        table.append((themes[keys[index]]["title"] if first else "", f"`{tag}`", value["description"]))
    return table


def markdown(table: list[tuple[str, str, str]]) -> str:
    header = ("Theme", "Tag", "Meaning")
    widths = [max(len(row[i]) for row in [header, *table]) for i in range(3)]

    def line(cells: tuple[str, str, str]) -> str:
        return "| " + " | ".join(cell.ljust(width) for cell, width in zip(cells, widths, strict=True)) + " |"

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
