// Rendering of education/*.json for the Education section of the home page.
// The CVs render their Education rubric from the same records.

import type { Education } from "./generated/records.ts";
import { escapeHtml, indent, joinItems, proseList, renderLinkedName } from "./html.ts";

export function renderEducation(education: Education): string[] {
  const lines = [
    `<h4>${joinItems([escapeHtml(education.degree), education.majors.map(renderLinkedName).join(" &amp; ")])}</h4>`,
    // The year the degree was awarded.
    `<li>${joinItems([escapeHtml(education.institution), education.end_date.slice(0, 4)])}</li>`,
  ];
  if (education.minors) {
    lines.push(`<li>Minors: ${escapeHtml(proseList(education.minors))}</li>`);
  }
  const research = [
    ...(education.research_group ? [`<li>Research with the ${renderLinkedName(education.research_group)}</li>`] : []),
    ...(education.theses ?? []).map(({ kind, title, url }) => {
      const quoted = `“${escapeHtml(title)}”`;
      return `<li>${escapeHtml(kind)} thesis: ${url ? `<a href="${escapeHtml(url)}">${quoted}</a>` : quoted}</li>`;
    }),
  ];
  if (research.length > 0) {
    lines.push("<br>", ...research);
  }
  if (education.coursework) {
    lines.push("<br>", `<p>Relevant coursework: ${escapeHtml(education.coursework.join(", "))}</p>`);
  }
  return ['<ul class="work-list">', ...indent(lines), "</ul>"];
}
