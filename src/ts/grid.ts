// The control for choosing how many columns a page's card grids show (see
// renderGridControl in src/build/grid.ts). The choice is kept in the page's
// URL, beside the search's, so a view can be linked to. Column counts the
// window is too narrow for are disabled, and the control is hidden where only
// one column fits, as on a phone.

/** Columns of `minWidth` pixels, `gap` apart, that fit in `width` pixels; at least one. */
function columnsThatFit(width: number, minWidth: number, gap: number): number {
  return Math.max(1, Math.floor((width + gap) / (minWidth + gap)));
}

function initGridControl(control: HTMLElement): void {
  const scope = control.closest<HTMLElement>("[data-search]");
  const grids = Array.from(scope?.querySelectorAll<HTMLElement>("[data-card-grid]") ?? []);
  const inputs = Array.from(control.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  if (!scope || grids.length === 0 || inputs.length === 0) {
    return;
  }
  const choices = inputs.map((input) => Number(input.value));
  const fallback = Number(control.dataset.gridDefault);
  const requested = Number(new URLSearchParams(window.location.search).get("columns"));
  // What the visitor asked for, which the grids show whenever the window is wide enough.
  let preferred = choices.includes(requested) ? requested : fallback;

  function update(): void {
    // A group hidden by the search measures 0 wide, but every grid spans the same width.
    const grid = grids.find((candidate) => candidate.clientWidth > 0) ?? grids[0];
    const style = getComputedStyle(grid);
    const fit = columnsThatFit(
      grid.clientWidth || scope!.clientWidth,
      parseFloat(style.getPropertyValue("--grid-min-card-width")) || 1,
      parseFloat(style.columnGap) || 0,
    );
    const shown = Math.max(...choices.filter((count) => count <= Math.min(preferred, fit)), Math.min(...choices));
    for (const target of grids) {
      target.style.setProperty("--grid-columns", String(preferred));
    }
    for (const input of inputs) {
      const count = Number(input.value);
      input.disabled = count > fit && count !== Math.min(...choices);
      input.checked = count === shown;
      input.parentElement!.title = input.disabled ? "Needs a wider window" : "";
    }
    control.hidden = fit < 2;
  }

  function writeUrl(): void {
    const next = new URLSearchParams(window.location.search);
    next.delete("columns");
    if (preferred !== fallback) {
      next.set("columns", String(preferred));
    }
    const search = next.toString();
    history.replaceState(history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }

  control.addEventListener("change", (event) => {
    preferred = Number((event.target as HTMLInputElement).value);
    update();
    writeUrl();
  });
  new ResizeObserver(update).observe(scope);
  update();
}

export function initGridControls(): void {
  document.querySelectorAll<HTMLElement>("[data-grid-control]").forEach(initGridControl);
}
