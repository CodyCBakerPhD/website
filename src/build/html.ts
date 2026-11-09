// Small helpers shared by the record renderers and the plugins that fill in
// the pages. Record text is plain text, so everything taken from a record goes
// through escapeHtml (or renderInline, which escapes first).

/** Separator between items on one line, matching the hand-written parts of the pages. */
export const SEPARATOR = " &nbsp; | &nbsp; ";

/**
 * Joins items (already HTML) into one line with SEPARATOR. Each item is kept whole, so the line wraps
 * between items rather than inside one, such as between "Modality:" and its value.
 */
export function joinItems(items: readonly string[], separator: string = SEPARATOR): string {
  return items.map((item) => `<span class="line-item">${item}</span>`).join(separator);
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Escapes `text`, then renders each **double-asterisk** span as <strong>. */
function renderInline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/** "pypi.org/project/historia" for https://pypi.org/project/historia/. */
export function displayUrl(url: string): string {
  const { host, pathname, search } = new URL(url);
  return `${host.replace(/^www\./, "")}${pathname.replace(/\/$/, "")}${search}`;
}

/** Renders paragraphs as one <p>, separated by blank lines as elsewhere on the page. */
export function renderParagraphs(paragraphs: readonly string[]): string[] {
  return ["<p>", paragraphs.map((paragraph) => `\t${renderInline(paragraph)}`).join("\n\t<br><br>\n"), "</p>"];
}

/** Renders whichever links are present as one line, in the order and with the labels of `labels`. */
export function renderLinks<K extends string>(
  links: Partial<Record<K, string>> | undefined,
  labels: Readonly<Record<K, string>>,
): string[] {
  const anchors = (Object.keys(labels) as K[]).flatMap((key) => {
    const url = links?.[key];
    return url ? [`<a href="${escapeHtml(url)}">${labels[key]}</a>`] : [];
  });
  return anchors.length > 0 ? [joinItems(anchors, `${SEPARATOR.trimEnd()}\n`)] : [];
}

/** Indents every line (including lines inside multi-line strings) by one tab. */
export function indent(lines: readonly string[]): string[] {
  return lines.flatMap((line) => line.split("\n")).map((line) => `\t${line}`);
}

/**
 * Renders a record as one card, which its page's search filters by `searchAttribute` (see search.ts).
 * The card's `id` is the record's, so other cards, and links shared from elsewhere, can open it.
 * Its corner links to that ID, as does selecting the card itself (see src/ts/cards.ts).
 */
export function renderCard(lines: readonly string[], searchAttribute: string, id: string, name: string): string[] {
  const permalink =
    `<li class="card-permalink"><a href="#${escapeHtml(id)}" aria-label="Link to ${escapeHtml(name)}" title="Link to this card">` +
    '<i class="fa fa-link" aria-hidden="true"></i></a></li>';
  return [`<ul class="work-list" id="${escapeHtml(id)}" data-card data-search-item ${searchAttribute}>`, ...indent([permalink, ...lines]), "</ul>"];
}

/** Matches a line holding only the <!-- build:NAME --> placeholder, capturing its indentation. */
function placeholderLine(name: string): RegExp {
  return new RegExp(`^([ \\t]*)<!-- build:${name} -->[ \\t]*$`, "m");
}

export function hasPlaceholder(html: string, name: string): boolean {
  return placeholderLine(name).test(html);
}

/** Replaces the <!-- build:NAME --> placeholder line in `html` with `lines`, keeping its indentation. */
export function fillPlaceholder(html: string, name: string, lines: readonly string[], page: string): string {
  const markerLine = placeholderLine(name);
  const match = markerLine.exec(html);
  if (!match) {
    throw new Error(`${page} is missing the <!-- build:${name} --> placeholder`);
  }
  const rendered = lines
    .flatMap((line) => line.split("\n"))
    .map((line) => (line ? match[1] + line : line))
    .join("\n");
  // A replacer function, so "$" sequences in the content are not special.
  return html.replace(markerLine, () => rendered);
}
