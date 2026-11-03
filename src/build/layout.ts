// The parts every page shares: the tags opening its <head>, the navigation
// bar and the footer. Each page under src/ marks where they go with
// <!-- build:head -->, <!-- build:header --> and <!-- build:footer -->, which
// are filled in from src/partials/ at build time. The navigation links, which
// both the navigation bar and the footer list, are rendered here rather than
// in the partials, so they can point within the current page and mark it as
// current.

import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import type { Plugin } from "vite";
import { escapeHtml, fillPlaceholder } from "./html.ts";

const HOME = "index.html";

/**
 * The address of a page, relative like every other URL on the site so that links work from a
 * nested PR preview too: the home page is "./", and any other page drops ".html" ("projects"),
 * which GitHub Pages and Vite's servers both resolve to the page's file.
 */
export function pageRoute(page: string): string {
  return page === HOME ? "./" : page.replace(/\.html$/, "");
}

interface NavLink {
  label: string;
  /** The page's file under src/. */
  page: string;
  /** ID of a section within the page to link to, rather than the page itself. */
  section?: string;
}

/** The navigation bar's links, in display order. */
const NAV: readonly NavLink[] = [
  { label: "About", page: HOME },
  { label: "Education", page: HOME, section: "education" },
  { label: "Skills", page: HOME, section: "skills" },
  { label: "Experience", page: HOME, section: "experience" },
  { label: "Projects", page: "projects.html" },
  { label: "Publications", page: "publications.html" },
  { label: "Data Curation", page: "data-curation.html" },
];

function renderNavLink({ label, page, section }: NavLink, current: string): string {
  const text = escapeHtml(label);
  if (page !== current) {
    const href = pageRoute(page) + (section ? `#${section}` : "");
    return `<li><a href="${escapeHtml(href)}">${text}</a></li>`;
  }
  if (section) {
    return `<li><a href="#${escapeHtml(section)}">${text}</a></li>`;
  }
  // The home page's own link scrolls back to the top (see src/ts/main.ts).
  if (page === HOME) {
    return `<li><a href="#" data-scroll-top>${text}</a></li>`;
  }
  return `<li class="active"><a href="${escapeHtml(pageRoute(page))}" aria-current="page">${text}</a></li>`;
}

/** Vite plugin that fills in the shared parts of every page, in both `vite build` and the dev server. */
export function pageLayout({ partialsDir }: { partialsDir: string }): Plugin {
  // Read on every page, so the dev server picks up edits to the partials.
  const partial = (name: string): string[] => readFileSync(resolve(partialsDir, `${name}.html`), "utf8").trimEnd().split("\n");

  return {
    name: "page-layout",
    transformIndexHtml: {
      // Before the record sections and the version stamp, which fill placeholders inside these parts.
      order: "pre",
      handler(html, { filename }) {
        const page = basename(filename);
        const nav = NAV.map((link) => renderNavLink(link, page));
        // The header and the footer both list the navigation links.
        const header = fillPlaceholder(partial("header").join("\n"), "nav", nav, "src/partials/header.html");
        const footer = fillPlaceholder(partial("footer").join("\n"), "nav", nav, "src/partials/footer.html");
        let result = fillPlaceholder(html, "head", partial("head"), page);
        result = fillPlaceholder(result, "header", [header], page);
        return fillPlaceholder(result, "footer", [footer], page);
      },
    },
  };
}
