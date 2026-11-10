// Site behavior shared by every page: the animated "typed" headline and
// smooth scrolling on the home page, the light/dark theme toggle, and the
// search, column choice and links to single cards on the pages listing
// records. Bundled by Vite into dist/assets/.

import { initCardLinks } from "./cards";
import { initGridControls } from "./grid";
import { initRecordSearch } from "./search";

/** Sections that moved off the home page onto pages of their own, by their old anchors. */
const MOVED_SECTIONS: Readonly<Record<string, string>> = {
  "#highlighted-projects": "projects",
  "#data-curation": "data-curation",
  "#publications": "publications",
};

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

/** Sends links to a section's old place on the home page on to its own page. */
function redirectMovedSection(): void {
  const { hash } = window.location;
  const page = MOVED_SECTIONS[hash];
  // The new pages keep the sections' IDs, so this only applies where the section is missing.
  if (page && !document.getElementById(hash.slice(1))) {
    window.location.replace(page);
  }
}

const HEADLINE_WORDS = ["data science", "informatics", "software"];

function initTypedHeadline(): void {
  const typed = document.getElementById("typed");
  if (!typed) {
    return;
  }
  // The typed text shares a grid cell with hidden copies of every word (with the
  // cursor), so the headline keeps the height of the longest and the page under it
  // does not jump when a word wraps on narrow screens.
  const line = document.createElement("span");
  line.className = "typed-line";
  const text = document.createElement("span");
  typed.replaceWith(line);
  text.append(typed);
  line.append(
    text,
    ...HEADLINE_WORDS.map((word) => {
      const copy = document.createElement("span");
      copy.className = "typed-reserve";
      const cursor = document.createElement("span");
      cursor.className = "typed-cursor";
      cursor.textContent = "|";
      copy.append(word, cursor);
      return copy;
    }),
  );

  $("#typed").typed({
    strings: HEADLINE_WORDS,
    typeSpeed: 90,
    backDelay: 700,
    contentType: "html",
    loop: true,
  });
}

function initSmoothNavigation(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    '.navbar a[href^="#"], .footer-nav a[href^="#"]',
  );
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      // On narrow screens the nav's links are in Kube's drop-down menu, which stays
      // open after a click and would cover the section. Hidden as it is on load (not
      // through the toggle, which also drops a margin and shortens the nav), it opens
      // again on the toggle's next tap.
      const menu = link.closest<HTMLElement>(".navigation-target-show");
      if (menu) {
        menu.style.display = "none";
      }

      // "About" scrolls back to the top and clears any hash from the URL.
      if ("scrollTop" in link.dataset) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.pushState(null, "", window.location.pathname);
        return;
      }

      const targetId = link.getAttribute("href");
      if (!targetId) {
        return;
      }
      const targetElement = document.querySelector<HTMLElement>(targetId);
      if (!targetElement) {
        return;
      }

      history.pushState(null, "", targetId);
      // Clears the sticky nav through scroll-padding-top in custom.css, as every other link to a section does.
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (e.g. private browsing); the toggle still
    // works for the current page load.
  }
}

function updateThemeToggleLabel(toggle: HTMLElement, theme: Theme): void {
  toggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
  );
}

function initThemeToggle(): void {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  updateThemeToggleLabel(toggle, currentTheme);

  toggle.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    const nextTheme: Theme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    updateThemeToggleLabel(toggle, nextTheme);
  });
}

redirectMovedSection();
// An old link opened from the home page itself only changes the hash, without reloading.
window.addEventListener("hashchange", redirectMovedSection);

// A listener of its own, so an error in the vendored plugin does not stop the rest.
document.addEventListener("DOMContentLoaded", initTypedHeadline);
document.addEventListener("DOMContentLoaded", () => {
  initSmoothNavigation();
  initThemeToggle();
  initRecordSearch();
  initGridControls();
  initCardLinks();
});
