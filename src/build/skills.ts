// Rendering of skills/*.json for the Technical Skills section of the home page.
// The CVs render their Skills rubric from the same records.

import type { SkillGroup } from "./generated/records.ts";
import { escapeHtml, indent } from "./html.ts";

/** One tag per skill, with nothing between them, as the stylesheet spaces them. */
function renderTags(skills: readonly string[]): string {
  return skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("");
}

export function renderSkillGroup(group: SkillGroup): string[] {
  const heading = `<h5>${escapeHtml(group.name)}${group.note ? ` <span>(${escapeHtml(group.note)})</span>` : ""}</h5>`;
  // The schema requires exactly one of skills and subgroups.
  const body = group.subgroups
    ? group.subgroups.flatMap(({ name, skills }) => [
        '<div class="skill-row">',
        `\t<span class="skill-sub">${escapeHtml(name)}</span><span class="skill-tags">${renderTags(skills)}</span>`,
        "</div>",
      ])
    : [renderTags(group.skills!)];
  return ['<div class="skill-group">', ...indent([heading, ...body]), "</div>"];
}
