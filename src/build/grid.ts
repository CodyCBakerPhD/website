// The grid a section lays its cards out in, set per section in sections.ts.
// The settings reach the stylesheet as custom properties on the grid's
// element, so src/css/custom.css holds the one rule that lays out every grid.
// Each card stays a direct child of its grid, since the search sorts and
// hides the cards in place (src/ts/search.ts). Subcards within a card, such
// as a project's repositories, take a mini grid of the same kind, set where
// they are rendered (references.ts). A section that offers choices of column
// count gets a control beside its search bar, which src/ts/grid.ts drives.

import { escapeHtml, indent } from "./html.ts";

export interface CardGrid {
  /** Most columns the cards are laid out in, on a screen wide enough for them all. */
  columns: number;
  /** Narrowest a card may get, in pixels, before the grid drops a column. */
  minCardWidth: number;
  /** Column counts a visitor can choose between on the page, including `columns`. Omitted for no choice. */
  choices?: readonly number[];
}

function checkGrid({ columns, minCardWidth, choices }: CardGrid): void {
  const isCount = (value: number): boolean => Number.isInteger(value) && value >= 1;
  if (!isCount(columns)) {
    throw new Error(`A card grid's columns must be a whole number of at least 1, not ${columns}`);
  }
  if (!Number.isFinite(minCardWidth) || minCardWidth <= 0) {
    throw new Error(`A card grid's minCardWidth must be a positive number of pixels, not ${minCardWidth}`);
  }
  if (choices) {
    if (choices.length < 2 || !choices.every(isCount) || new Set(choices).size !== choices.length) {
      throw new Error(`A card grid's choices must be two or more different whole numbers of at least 1, not [${choices.join(", ")}]`);
    }
    if (!choices.includes(columns)) {
      throw new Error(`A card grid's choices [${choices.join(", ")}] must include its columns, ${columns}`);
    }
  }
}

/**
 * Lays out rendered cards in `grid`, or, as a mini grid, the subcards within a card (such as its
 * repositories), which sit closer together and which the page's Columns control leaves alone.
 */
export function renderGrid(grid: CardGrid, cards: readonly string[], kind: "cards" | "subcards" = "cards"): string[] {
  checkGrid(grid);
  const style = `--grid-columns: ${grid.columns}; --grid-min-card-width: ${grid.minCardWidth}px;`;
  const open = kind === "cards" ? `<div class="card-grid" style="${style}" data-card-grid>` : `<div class="subcard-grid" style="${style}">`;
  return [open, ...indent(cards), "</div>"];
}

/**
 * The control for choosing how many columns the grids of a search's section show, or nothing if
 * the grid offers no choice. Hidden until the page's script shows it, since it does nothing without.
 */
export function renderGridControl(grid: CardGrid, id: string): string[] {
  checkGrid(grid);
  if (!grid.choices) {
    return [];
  }
  const label = `${id}-columns-label`;
  const options = [...grid.choices]
    .sort((a, b) => a - b)
    .map((count) => `<label><input type="radio" name="columns" value="${count}"><span>${count}</span></label>`);
  return [
    `<div class="record-grid-control" role="radiogroup" aria-labelledby="${escapeHtml(label)}" data-grid-control data-grid-default="${grid.columns}" hidden>`,
    ...indent([`<span id="${escapeHtml(label)}">Columns</span>`, '<span class="record-grid-choices">', ...indent(options), "</span>"]),
    "</div>",
  ];
}
