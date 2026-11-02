// Search on the pages listing records (projects, data curation projects and
// publications), after DANDI's search: free text plus key:value filters such
// as standards:NWB or role:"Lead Developer", every term of which must match,
// with a dropdown suggesting filters and their values, and a choice of order.
// The markup and data come from src/build/search.ts. The search and the order
// are kept in the page's URL (?q=...&sort=...), so a view can be linked to.

type FilterKind = "field" | "year" | "tag" | "theme";

interface Filter {
  key: string;
  description: string;
  kind: FilterKind;
}

interface SortOrder {
  id: string;
  label: string;
  descending?: boolean;
}

interface Settings {
  noun: string;
  filters: Filter[];
  sorts: SortOrder[];
}

interface RecordData {
  fields: Record<string, string[]>;
  years: [number, number | null] | null;
  sort: Record<string, string>;
}

interface Item {
  element: HTMLElement;
  /** Position in the featured order. */
  index: number;
  text: string;
  /** Each filter's values for this record, normalized. */
  values: Map<string, string[]>;
  years: [number, number] | null;
  sort: Record<string, string>;
}

/** One term of a search, and where it sits in the search's text. */
interface Term {
  start: number;
  end: number;
  /** The filter's key, lowercased, or null for free text. */
  key: string | null;
  value: string;
}

interface Suggestion {
  /** The term that replaces the one being typed. */
  text: string;
  key: string;
  value: string;
  /** Description of a filter, or how many records have a value. */
  hint: string;
  /** Whether the term is complete, rather than a filter's key awaiting its value. */
  complete: boolean;
  theme?: string;
}

interface SuggestionGroup {
  label: string;
  suggestions: Suggestion[];
}

/** Delay before the URL catches up with typing (Safari throttles frequent history updates). */
const URL_UPDATE_DELAY_MS = 300;

const MAX_VALUE_SUGGESTIONS = 8;

const CURRENT_YEAR = new Date().getFullYear();

/** Lowercases, strips accents (so "rubel" finds "Rübel") and collapses whitespace. */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Splits a search into terms at whitespace outside double quotes. Quotes keep a phrase or value together. */
function parseTerms(query: string): Term[] {
  const terms: Term[] = [];
  let position = 0;
  while (position < query.length) {
    if (/\s/.test(query[position])) {
      position++;
      continue;
    }
    const start = position;
    let quoted = false;
    while (position < query.length && (quoted || !/\s/.test(query[position]))) {
      quoted = query[position] === '"' ? !quoted : quoted;
      position++;
    }
    const raw = query.slice(start, position);
    // A term opening with a quote is literal text, even if it holds a colon.
    const filter = /^([a-z][\w-]*):(.*)$/is.exec(raw);
    terms.push({
      start,
      end: position,
      key: filter ? filter[1].toLowerCase() : null,
      value: (filter ? filter[2] : raw).replace(/"/g, ""),
    });
  }
  return terms;
}

function formatTerm(key: string, value: string): string {
  return `${key}:${/[\s"]/.test(value) ? `"${value.replace(/"/g, "")}"` : value}`;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

/** The known key a mistyped one most likely meant, if any is close. */
function closestKey(key: string, keys: readonly string[]): string | undefined {
  const ranked = keys.map((known) => ({ known, distance: editDistance(key, known) })).sort((a, b) => a.distance - b.distance);
  return ranked.length > 0 && ranked[0].distance <= 2 ? ranked[0].known : undefined;
}

/** Whether the years of a record satisfy a year: value such as 2024, >=2023 or <2020. */
function matchesYear([from, to]: [number, number], comparison: string, year: number): boolean {
  switch (comparison) {
    case ">":
      return to > year;
    case ">=":
      return to >= year;
    case "<":
      return from < year;
    case "<=":
      return from <= year;
    default:
      return from <= year && year <= to;
  }
}

function compareSortValues(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/** Where the sticky navigation bar ends, so content above it counts as out of view. */
function navBottom(): number {
  return document.querySelector(".main-nav")?.getBoundingClientRect().bottom ?? 0;
}

function readSettings(form: HTMLElement): Settings | null {
  try {
    return JSON.parse(form.dataset.searchConfig ?? "") as Settings;
  } catch {
    return null;
  }
}

function readItem(element: HTMLElement, index: number): Item {
  const data = JSON.parse(element.dataset.searchRecord ?? "{}") as Partial<RecordData>;
  const values = new Map<string, string[]>();
  for (const [key, fieldValues] of Object.entries(data.fields ?? {})) {
    values.set(key, fieldValues);
  }
  for (const button of element.querySelectorAll<HTMLElement>("[data-tag]")) {
    const tag = button.dataset.tag ?? "";
    const separator = tag.indexOf(":");
    const theme = tag.slice(0, separator);
    const name = tag.slice(separator + 1);
    values.set(theme, [...(values.get(theme) ?? []), name]);
    values.set("tag", [...(values.get("tag") ?? []), name]);
  }
  return {
    element,
    index,
    text: normalize(element.textContent ?? ""),
    values,
    years: data.years ? [data.years[0], data.years[1] ?? CURRENT_YEAR] : null,
    sort: data.sort ?? {},
  };
}

interface SearchBar {
  form: HTMLFormElement;
  input: HTMLInputElement;
  list: HTMLUListElement;
  sortSelect: HTMLSelectElement;
  status: HTMLElement;
  clear: HTMLButtonElement;
}

function findSearchBar(scope: HTMLElement): SearchBar | null {
  const form = scope.querySelector<HTMLFormElement>("[data-search-form]");
  const input = scope.querySelector<HTMLInputElement>("[data-search-input]");
  const list = scope.querySelector<HTMLUListElement>("[data-search-suggestions]");
  const sortSelect = scope.querySelector<HTMLSelectElement>("[data-search-sort]");
  const status = scope.querySelector<HTMLElement>("[data-search-status]");
  const clear = scope.querySelector<HTMLButtonElement>("[data-search-clear]");
  return form && input && list && sortSelect && status && clear ? { form, input, list, sortSelect, status, clear } : null;
}

function initSearch(scope: HTMLElement): void {
  const bar = findSearchBar(scope);
  const settings = bar && readSettings(bar.form);
  if (!bar || !settings) {
    return;
  }
  const { form, input, list, sortSelect, status, clear } = bar;
  const { noun, sorts } = settings;

  const items = Array.from(scope.querySelectorAll<HTMLElement>("[data-search-item]"), readItem);
  const groups = Array.from(scope.querySelectorAll<HTMLElement>("[data-search-group]"));
  const tagButtons = Array.from(scope.querySelectorAll<HTMLButtonElement>("[data-search-item] [data-tag]"));

  // How many records have each value of each filter, most common first.
  const valueCounts = new Map<string, { value: string; count: number }[]>();
  for (const filter of settings.filters) {
    const counts = new Map<string, number>();
    for (const item of items) {
      const values =
        filter.kind === "year"
          ? item.years
            ? Array.from({ length: item.years[1] - item.years[0] + 1 }, (_, offset) => String(item.years![0] + offset))
            : []
          : (item.values.get(filter.key) ?? []);
      new Set(values).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    }
    const ranked = [...counts].map(([value, count]) => ({ value, count }));
    ranked.sort((a, b) =>
      filter.kind === "year" ? Number(b.value) - Number(a.value) : b.count - a.count || compareSortValues(a.value, b.value),
    );
    valueCounts.set(filter.key, ranked);
  }
  // Only filters something on this page has a value for.
  const filters = new Map(settings.filters.filter((filter) => valueCounts.get(filter.key)?.length).map((filter) => [filter.key, filter]));
  const tipExample = [...filters.values()]
    .filter((filter) => filter.kind === "theme")
    .flatMap((filter) => valueCounts.get(filter.key)!.map(({ value }) => formatTerm(filter.key, value)))
    .find((term) => term.includes('"'));

  let urlTimer: number | undefined;
  let suggestions: Suggestion[] = [];
  let active = -1;

  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") ?? "";
  const requestedSort = params.get("sort");
  sortSelect.value = sorts.some((sort) => sort.id === requestedSort) ? requestedSort! : "featured";

  function writeUrl(): void {
    window.clearTimeout(urlTimer);
    urlTimer = window.setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      next.delete("q");
      next.delete("sort");
      if (input.value.trim()) {
        next.set("q", input.value.trim());
      }
      if (sortSelect.value !== "featured") {
        next.set("sort", sortSelect.value);
      }
      const search = next.toString();
      history.replaceState(history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
    }, URL_UPDATE_DELAY_MS);
  }

  /** Tests for the search's terms, and descriptions of any terms that could not be used as typed. */
  function compile(terms: readonly Term[]): { tests: ((item: Item) => boolean)[]; problems: string[] } {
    const tests: ((item: Item) => boolean)[] = [];
    const problems = new Set<string>();
    for (const term of terms) {
      const filter = term.key === null ? undefined : filters.get(term.key);
      if (term.key !== null && !filter) {
        const suggestion = closestKey(term.key, [...filters.keys()]);
        problems.add(
          `There is no ${term.key}: filter, so it was searched as text.${suggestion ? ` Did you mean ${suggestion}:?` : ""}`,
        );
      }
      const value = normalize(term.value);
      if (!value) {
        continue;
      }
      if (!filter) {
        const text = term.key === null ? value : normalize(`${term.key}:${term.value}`);
        tests.push((item) => item.text.includes(text));
      } else if (filter.kind === "year") {
        const match = /^(>=|<=|>|<|=)?(\d{4})$/.exec(value.replace(/\s/g, ""));
        if (!match) {
          problems.add("Write years like year:2024, or year:>=2023 for a range.");
          continue;
        }
        const [, comparison = "=", year] = match;
        tests.push((item) => item.years !== null && matchesYear(item.years, comparison, Number(year)));
      } else {
        tests.push((item) => (item.values.get(filter.key) ?? []).some((candidate) => normalize(candidate).includes(value)));
      }
    }
    return { tests, problems: [...problems] };
  }

  function isTagActive(terms: readonly Term[], theme: string, name: string): boolean {
    return terms.some((term) => term.key === theme && normalize(term.value) === normalize(name));
  }

  function applySort(): void {
    const order = sorts.find((sort) => sort.id === sortSelect.value);
    const byParent = new Map<HTMLElement, Item[]>();
    for (const item of items) {
      const parent = item.element.parentElement!;
      byParent.set(parent, [...(byParent.get(parent) ?? []), item]);
    }
    for (const [parent, siblings] of byParent) {
      siblings.sort((a, b) => {
        if (!order || order.id === "featured") {
          return a.index - b.index;
        }
        const compared = compareSortValues(a.sort[order.id] ?? "", b.sort[order.id] ?? "");
        return (order.descending ? -compared : compared) || a.index - b.index;
      });
      parent.append(...siblings.map((item) => item.element));
    }
  }

  function render(): void {
    const terms = parseTerms(input.value);
    const { tests, problems } = compile(terms);
    let shown = 0;
    for (const item of items) {
      const match = tests.every((test) => test(item));
      item.element.hidden = !match;
      shown += match ? 1 : 0;
    }
    for (const group of groups) {
      group.hidden = !group.querySelector("[data-search-item]:not([hidden])");
    }
    for (const button of tagButtons) {
      const tag = button.dataset.tag ?? "";
      const separator = tag.indexOf(":");
      button.setAttribute("aria-pressed", String(isTagActive(terms, tag.slice(0, separator), tag.slice(separator + 1))));
    }

    clear.hidden = !input.value.trim();
    const summary =
      tests.length === 0
        ? `${items.length} ${noun}. Select any tag to filter by it.`
        : shown === 0
          ? `No ${noun} match.`
          : `Showing ${shown} of ${items.length} ${noun}.`;
    status.textContent = [summary, ...problems].join(" ");
  }

  /** The term the caret is in, or an empty one where a new term would start. */
  function termAtCaret(): Term {
    const caret = input.selectionStart ?? input.value.length;
    return (
      parseTerms(input.value).find((term) => term.start <= caret && caret <= term.end) ?? {
        start: caret,
        end: caret,
        key: null,
        value: "",
      }
    );
  }

  function valueSuggestions(filter: Filter, typed: string): Suggestion[] {
    return (valueCounts.get(filter.key) ?? [])
      .filter(({ value }) => normalize(value).includes(typed))
      .slice(0, MAX_VALUE_SUGGESTIONS)
      .map(({ value, count }) => ({
        text: formatTerm(filter.key, value),
        key: filter.key,
        value,
        hint: String(count),
        complete: true,
        theme: filter.kind === "theme" ? filter.key : undefined,
      }));
  }

  function filterSuggestion(filter: Filter): Suggestion {
    return { text: `${filter.key}:`, key: filter.key, value: "", hint: filter.description, complete: false };
  }

  function suggestionGroups(term: Term): SuggestionGroup[] {
    if (term.key !== null) {
      const filter = filters.get(term.key);
      if (filter) {
        return [{ label: filter.description, suggestions: valueSuggestions(filter, normalize(term.value)) }];
      }
      const suggestion = closestKey(term.key, [...filters.keys()]);
      return suggestion ? [{ label: "Did you mean", suggestions: [filterSuggestion(filters.get(suggestion)!)] }] : [];
    }
    const typed = normalize(term.value);
    const matchingFilters = [...filters.values()].filter((filter) => filter.key.startsWith(typed));
    const groupsToShow: SuggestionGroup[] = [{ label: "Filters", suggestions: matchingFilters.map(filterSuggestion) }];
    if (typed.length >= 2) {
      const values = [...filters.values()]
        .filter((filter) => filter.kind !== "tag")
        .flatMap((filter) => valueSuggestions(filter, typed))
        .sort((a, b) => Number(b.hint) - Number(a.hint))
        .slice(0, MAX_VALUE_SUGGESTIONS);
      groupsToShow.unshift({ label: "Matching values", suggestions: values });
    }
    return groupsToShow;
  }

  function highlight(index: number): void {
    active = index;
    list.querySelectorAll<HTMLElement>("[role=option]").forEach((option, position) => {
      option.setAttribute("aria-selected", String(position === index));
      if (position === index) {
        option.scrollIntoView({ block: "nearest" });
      }
    });
    if (index >= 0) {
      input.setAttribute("aria-activedescendant", `${list.id}-${index}`);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function closeSuggestions(): void {
    list.hidden = true;
    list.replaceChildren();
    suggestions = [];
    input.setAttribute("aria-expanded", "false");
    highlight(-1);
  }

  function openSuggestions(): void {
    const term = termAtCaret();
    const shownGroups = suggestionGroups(term).filter((group) => group.suggestions.length > 0);
    suggestions = shownGroups.flatMap((group) => group.suggestions);
    if (suggestions.length === 0) {
      closeSuggestions();
      return;
    }

    const rows: HTMLLIElement[] = [];
    for (const group of shownGroups) {
      const label = document.createElement("li");
      label.className = "record-search-group-label";
      label.setAttribute("role", "presentation");
      label.textContent = group.label;
      rows.push(label);
      for (const suggestion of group.suggestions) {
        const index = rows.filter((row) => row.getAttribute("role") === "option").length;
        const option = document.createElement("li");
        option.className = suggestion.complete ? "record-search-option" : "record-search-option record-search-option-filter";
        option.id = `${list.id}-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");

        const termText = document.createElement("span");
        termText.className = "record-search-option-term";
        if (suggestion.theme) {
          const swatch = document.createElement("span");
          swatch.className = `record-search-swatch tag-${suggestion.theme}`;
          swatch.setAttribute("aria-hidden", "true");
          termText.append(swatch);
        }
        const key = document.createElement("span");
        key.className = "record-search-option-key";
        key.textContent = `${suggestion.key}:`;
        const value = document.createElement("span");
        value.className = "record-search-option-value";
        value.textContent = suggestion.text.slice(suggestion.key.length + 1);
        termText.append(key, value);

        const hint = document.createElement("span");
        hint.className = suggestion.complete ? "record-search-option-count" : "record-search-option-hint";
        hint.textContent = suggestion.hint;
        if (suggestion.complete) {
          hint.title = `${suggestion.hint} of the ${noun} on this page`;
        }

        option.append(termText, hint);
        option.addEventListener("click", () => choose(index));
        option.addEventListener("mousemove", () => {
          if (active !== index) {
            highlight(index);
          }
        });
        rows.push(option);
      }
    }
    if (term.key === null && !term.value) {
      const tip = document.createElement("li");
      tip.className = "record-search-tip";
      tip.setAttribute("role", "presentation");
      tip.textContent = `Every term has to match. Quote values with spaces${tipExample ? `, as in ${tipExample}` : ""}.`;
      rows.push(tip);
    }

    list.replaceChildren(...rows);
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    highlight(-1);
  }

  function choose(index: number): void {
    const suggestion = suggestions[index];
    if (!suggestion) {
      return;
    }
    const term = termAtCaret();
    const before = input.value.slice(0, term.start);
    const after = input.value.slice(term.end);
    const inserted = suggestion.complete ? `${suggestion.text} ` : suggestion.text;
    input.value = before + inserted + (suggestion.complete ? after.trimStart() : after);
    const caret = before.length + inserted.length;
    input.setSelectionRange(caret, caret);
    render();
    writeUrl();
    if (suggestion.complete) {
      closeSuggestions();
    } else {
      openSuggestions();
    }
  }

  function toggleTag(tag: string): void {
    const separator = tag.indexOf(":");
    const theme = tag.slice(0, separator);
    const name = tag.slice(separator + 1);
    const terms = parseTerms(input.value);
    const kept = terms.filter((term) => !(term.key === theme && normalize(term.value) === normalize(name)));
    const parts = kept.map((term) => input.value.slice(term.start, term.end));
    if (kept.length === terms.length) {
      parts.push(formatTerm(theme, name));
    }
    input.value = parts.join(" ");
    render();
    writeUrl();
  }

  input.addEventListener("input", () => {
    render();
    writeUrl();
    openSuggestions();
  });
  input.addEventListener("focus", openSuggestions);
  input.addEventListener("click", openSuggestions);
  input.addEventListener("blur", closeSuggestions);
  // Keeps focus in the input when the list (an option, or its scroll bar) is pressed, so it stays open.
  list.addEventListener("mousedown", (event) => event.preventDefault());
  input.addEventListener("keyup", (event) => {
    // The caret may have moved to another term.
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) && !list.hidden) {
      openSuggestions();
    }
  });
  input.addEventListener("keydown", (event) => {
    const open = !list.hidden;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openSuggestions();
        return;
      }
      const count = suggestions.length;
      highlight(event.key === "ArrowDown" ? (active + 1) % count : active <= 0 ? count - 1 : active - 1);
    } else if (event.key === "Enter" && open && active >= 0) {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        closeSuggestions();
      } else if (input.value) {
        event.preventDefault();
        input.value = "";
        render();
        writeUrl();
      }
    }
  });
  // Results update as you type, so submitting (pressing Enter) only puts the keyboard away.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    closeSuggestions();
    input.blur();
  });
  sortSelect.addEventListener("change", () => {
    applySort();
    writeUrl();
  });
  clear.addEventListener("click", () => {
    input.value = "";
    render();
    writeUrl();
    input.focus();
  });

  scope.addEventListener("click", (event) => {
    const tag = (event.target as Element).closest<HTMLElement>("[data-search-item] [data-tag]")?.dataset.tag;
    if (!tag) {
      return;
    }
    toggleTag(tag);
    if (form.getBoundingClientRect().top < navBottom()) {
      // Bring the search back into view, so the result of the click is visible.
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  render();
  applySort();
}

export function initRecordSearch(): void {
  document.querySelectorAll<HTMLElement>("[data-search]").forEach(initSearch);
}
