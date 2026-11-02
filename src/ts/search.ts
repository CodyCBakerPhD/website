// Search on the pages listing records (projects, datasets and publications):
// filters the cards by free text and by tag. The markup comes from
// src/build/search.ts. The filters are kept in the page's URL, as
// ?q=...&tag=theme:tag, so a filtered view can be bookmarked or shared.

interface Filters {
  query: string;
  /** Tags a card must all have to be shown, as theme:tag pairs. */
  tags: readonly string[];
}

interface Item {
  element: HTMLElement;
  text: string;
  tags: ReadonlySet<string>;
}

/** Delay before the URL catches up with typing (Safari throttles frequent history updates). */
const URL_UPDATE_DELAY_MS = 300;

/** Lowercases, strips accents (so "rubel" finds "Rübel") and collapses whitespace. */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Where the sticky navigation bar ends, so content above it counts as out of view. */
function navBottom(): number {
  return document.querySelector(".main-nav")?.getBoundingClientRect().bottom ?? 0;
}

function readFilters(knownTags: ReadonlySet<string>): Filters {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get("q") ?? "",
    tags: [...new Set(params.getAll("tag"))].filter((tag) => knownTags.has(tag)),
  };
}

function writeFilters({ query, tags }: Filters): void {
  const params = new URLSearchParams(window.location.search);
  params.delete("q");
  params.delete("tag");
  if (query.trim()) {
    params.set("q", query.trim());
  }
  tags.forEach((tag) => params.append("tag", tag));
  const search = params.toString();
  history.replaceState(history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
}

interface SearchBar {
  form: HTMLFormElement;
  input: HTMLInputElement;
  status: HTMLElement;
  chips: HTMLElement;
  clear: HTMLButtonElement;
}

function findSearchBar(scope: HTMLElement): SearchBar | null {
  const form = scope.querySelector<HTMLFormElement>("[data-search-form]");
  const input = scope.querySelector<HTMLInputElement>("[data-search-input]");
  const status = scope.querySelector<HTMLElement>("[data-search-status]");
  const chips = scope.querySelector<HTMLElement>("[data-search-tags]");
  const clear = scope.querySelector<HTMLButtonElement>("[data-search-clear]");
  return form && input && status && chips && clear ? { form, input, status, chips, clear } : null;
}

function initSearch(scope: HTMLElement): void {
  const bar = findSearchBar(scope);
  if (!bar) {
    return;
  }
  const { form, input, status, chips, clear } = bar;

  const noun = scope.dataset.search ?? "records";
  const tagButtons = Array.from(scope.querySelectorAll<HTMLButtonElement>("[data-search-item] [data-tag]"));
  const groups = Array.from(scope.querySelectorAll<HTMLElement>("[data-search-group]"));
  const items: Item[] = Array.from(scope.querySelectorAll<HTMLElement>("[data-search-item]"), (element) => ({
    element,
    text: normalize(element.textContent ?? ""),
    tags: new Set(Array.from(element.querySelectorAll<HTMLElement>("[data-tag]"), (tag) => tag.dataset.tag ?? "")),
  }));
  const knownTags = new Set(items.flatMap((item) => [...item.tags]));

  let filters = readFilters(knownTags);
  let urlTimer: number | undefined;
  input.value = filters.query;

  /** One removable label per active tag, copied from a card's label for that tag. */
  function renderChips(): void {
    chips.replaceChildren(
      ...filters.tags.flatMap((tag) => {
        const source = tagButtons.find((button) => button.dataset.tag === tag);
        if (!source) {
          return [];
        }
        const chip = source.cloneNode(true) as HTMLButtonElement;
        chip.removeAttribute("aria-pressed");
        chip.setAttribute("aria-label", `Remove the filter for ${(source.textContent ?? tag).trim()}`);
        const icon = document.createElement("i");
        icon.className = "fa fa-times";
        icon.setAttribute("aria-hidden", "true");
        chip.querySelector(".tag-name")?.append(" ", icon);
        return [chip];
      }),
    );
  }

  function render(): void {
    const terms = normalize(filters.query).split(" ").filter(Boolean);
    let shown = 0;
    for (const item of items) {
      const match = terms.every((term) => item.text.includes(term)) && filters.tags.every((tag) => item.tags.has(tag));
      item.element.hidden = !match;
      shown += match ? 1 : 0;
    }
    for (const group of groups) {
      group.hidden = !group.querySelector("[data-search-item]:not([hidden])");
    }
    for (const button of tagButtons) {
      button.setAttribute("aria-pressed", String(filters.tags.includes(button.dataset.tag ?? "")));
    }
    renderChips();

    const filtered = terms.length > 0 || filters.tags.length > 0;
    clear.hidden = !filtered;
    status.textContent = !filtered
      ? `${items.length} ${noun}. Select a tag to show only the ${noun} that have it.`
      : shown === 0
        ? `No ${noun} match.`
        : `Showing ${shown} of ${items.length} ${noun}`;
  }

  function update(next: Filters): void {
    filters = next;
    render();
    window.clearTimeout(urlTimer);
    urlTimer = window.setTimeout(() => writeFilters(filters), URL_UPDATE_DELAY_MS);
  }

  function toggleTag(tag: string): void {
    const tags = filters.tags.includes(tag) ? filters.tags.filter((active) => active !== tag) : [...filters.tags, tag];
    update({ ...filters, tags });
  }

  input.addEventListener("input", () => update({ ...filters, query: input.value }));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      update({ ...filters, query: "" });
    }
  });
  // Filtering is live, so submitting (pressing Enter) has nothing left to do.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    input.blur();
  });
  clear.addEventListener("click", () => {
    input.value = "";
    update({ query: "", tags: [] });
    input.focus();
  });

  scope.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-tag]");
    const tag = button?.dataset.tag;
    if (!button || !tag) {
      return;
    }
    const fromChip = chips.contains(button);
    toggleTag(tag);
    if (fromChip) {
      // The chip just clicked is gone, so keep focus within the search.
      input.focus();
    } else if (form.getBoundingClientRect().top < navBottom()) {
      // Bring the search back into view, so the result of the click is visible.
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  render();
}

export function initRecordSearch(): void {
  document.querySelectorAll<HTMLElement>("[data-search]").forEach(initSearch);
}
