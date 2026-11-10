// Rendering of experience/*.json for the Experience section of the home page.
// The CVs render their Experience rubric from the same records.

import type { Position } from "./generated/records.ts";
import { escapeHtml, formatYears, indent, joinItems, renderLinkedName, renderParagraphs } from "./html.ts";

export function renderPosition(position: Position): string[] {
  const institution = position.institution ? [escapeHtml(position.institution)] : [];
  const departments = (position.departments ?? []).map(renderLinkedName);
  // Departments, when there are any, go on a line of their own with the institution.
  const where = [
    joinItems([renderLinkedName(position.organization), ...(departments.length > 0 ? [] : institution), formatYears(position.start_date, position.end_date)]),
    ...(departments.length > 0 ? [joinItems([...departments, ...institution])] : []),
  ];
  return [
    '<ul class="work-list">',
    ...indent([`<h3>${escapeHtml(position.title)}</h3>`, `<li>${where.join("<br>")}</li>`, "<br>", ...renderParagraphs(position.description)]),
    "</ul>",
  ];
}
