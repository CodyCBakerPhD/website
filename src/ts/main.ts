// Site behavior shared by every page: the animated "typed" headline and
// smooth scrolling on the home page, the nav's menu on narrow screens, the
// light/dark theme toggle, and the search, column choice and links to single
// cards on the pages listing records. Bundled by Vite into dist/assets/.

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

// The headline's timing, as typed.js 1.x gave it before this replaced it.
const TYPE_PAUSE_MS = 90;
const WORD_HOLD_MS = 700;
const PAUSE_JITTER_MS = 70;

/** Open on narrow screens, where custom.css folds the nav's links into a menu under the bar's toggle. */
const MENU_OPEN_CLASS = "navigation-open";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const jitter = () => Math.round(PAUSE_JITTER_MS * Math.random());

/** Types each word, holds it, deletes it and moves on to the next, forever. */
async function typeWords(element: HTMLElement, words: readonly string[]): Promise<void> {
  for (let index = 0; ; index = (index + 1) % words.length) {
    const word = words[index];
    // typed.js paused before each character, and once more after the last before holding the word.
    for (let length = 1; length <= word.length + 1; length++) {
      await sleep(TYPE_PAUSE_MS + jitter());
      element.textContent = word.slice(0, length);
    }
    await sleep(WORD_HOLD_MS);
    for (let length = word.length; length >= 0; length--) {
      await sleep(jitter());
      element.textContent = word.slice(0, length);
    }
  }
}

function typingCursor(): HTMLElement {
  const cursor = document.createElement("span");
  cursor.className = "typed-cursor";
  cursor.textContent = "|";
  return cursor;
}

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
  text.append(typed, typingCursor());
  line.append(
    text,
    ...HEADLINE_WORDS.map((word) => {
      const copy = document.createElement("span");
      copy.className = "typed-reserve";
      copy.append(word, typingCursor());
      return copy;
    }),
  );
  void typeWords(typed, HEADLINE_WORDS);
}

function initNavigationMenu(): void {
  const menu = document.getElementById("navbar-1");
  document.querySelector(".navigation-toggle span")?.addEventListener("click", () => {
    menu?.classList.toggle(MENU_OPEN_CLASS);
  });
}

function initSmoothNavigation(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    '.navbar a[href^="#"], .footer-nav a[href^="#"]',
  );
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      // An open menu would otherwise stay open over the section.
      document.getElementById("navbar-1")?.classList.remove(MENU_OPEN_CLASS);

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

document.addEventListener("DOMContentLoaded", () => {
  initTypedHeadline();
  initNavigationMenu();
  initSmoothNavigation();
  initThemeToggle();
  initRecordSearch();
  initGridControls();
  initCardLinks();
});
