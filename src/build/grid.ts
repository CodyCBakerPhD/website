// The grid a section lays its cards out in, set per section in sections.ts.
// The settings reach the stylesheet as custom properties on the grid's
// element, so src/css/custom.css holds the one rule that lays out every grid.
// Each card stays a direct child of its grid, since the search sorts and
// hides the cards in place (src/ts/search.ts).

import { indent } from "./html.ts";

export interface CardGrid {
  /** Most columns the cards are laid out in, on a screen wide enough for them all. */
  columns: number;
  /** Narrowest a card may get, in pixels, before the grid drops a column. */
  minCardWidth: number;
}

function checkGrid({ columns, minCardWidth }: CardGrid): void {
  if (!Number.isInteger(columns) || columns < 1) {
    throw new Error(`A card grid's columns must be a whole number of at least 1, not ${columns}`);
  }
  if (!Number.isFinite(minCardWidth) || minCardWidth <= 0) {
    throw new Error(`A card grid's minCardWidth must be a positive number of pixels, not ${minCardWidth}`);
  }
}

/** Lays out rendered cards in `grid`. */
export function renderGrid(grid: CardGrid, cards: readonly string[]): string[] {
  checkGrid(grid);
  const style = `--grid-columns: ${grid.columns}; --grid-min-card-width: ${grid.minCardWidth}px;`;
  return [`<div class="card-grid" style="${style}">`, ...indent(cards), "</div>"];
}
