// Small helpers shared by the record renderers. Record text is plain text, so
// everything taken from a record goes through escapeHtml (or renderInline,
// which escapes first).

/** Separator between items on one line, matching the rest of index.html. */
export const SEPARATOR = " &nbsp; | &nbsp; ";

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
export function renderInline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
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
  return anchors.length > 0 ? [anchors.join(`${SEPARATOR.trimEnd()}\n`)] : [];
}

/** Indents every line (including lines inside multi-line strings) by one tab. */
export function indent(lines: readonly string[]): string[] {
  return lines.flatMap((line) => line.split("\n")).map((line) => `\t${line}`);
}
