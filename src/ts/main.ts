// Site behavior shared by every page: the animated "typed" headline and
// smooth scrolling on the home page, the light/dark theme toggle, and the
// search on the pages listing records. Bundled by Vite into dist/assets/.

import { initRecordSearch } from "./search";

/** Fallback when the nav bar has not rendered yet (matches its CSS height). */
const DEFAULT_NAV_OFFSET_PX = 80;

/** Sections that moved off the home page onto pages of their own, by their old anchors. */
const MOVED_SECTIONS: Readonly<Record<string, string>> = {
  "#highlighted-projects": "projects.html",
  "#data-curation": "data-curation.html",
  "#publications": "publications.html",
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

function initTypedHeadline(): void {
  if (!document.getElementById("typed")) {
    return;
  }
  $("#typed").typed({
    strings: ["data science", "informatics", "software"],
    typeSpeed: 90,
    backDelay: 700,
    contentType: "html",
    loop: true,
  });

  $(".reset").click(function () {
    $("#typed").typed("reset");
  });
}

function scrollToTarget(targetElement: HTMLElement, navOffset: number): void {
  // Mark only the active target so CSS can compensate for the fixed nav.
  document
    .querySelectorAll(".scroll-offset")
    .forEach((el) => el.classList.remove("scroll-offset"));
  targetElement.classList.add("scroll-offset");

  const targetPosition =
    targetElement.getBoundingClientRect().top + window.pageYOffset - navOffset;
  window.scrollTo({ top: targetPosition, behavior: "smooth" });
}

function initSmoothNavigation(): void {
  const nav = document.querySelector<HTMLElement>(".main-nav");
  const navOffset = nav?.offsetHeight || DEFAULT_NAV_OFFSET_PX;

  const links = document.querySelectorAll<HTMLAnchorElement>(
    '.navbar a[href^="#"]',
  );
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      // "About" scrolls back to the top and clears any hash from the URL.
      if (link.hasAttribute("data-scroll-top")) {
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
      scrollToTarget(targetElement, navOffset);
    });
  });
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
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

  const currentTheme =
    document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  updateThemeToggleLabel(toggle, currentTheme);

  toggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme: Theme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    updateThemeToggleLabel(toggle, nextTheme);
  });
}

redirectMovedSection();
// An old link opened from the home page itself only changes the hash, without reloading.
window.addEventListener("hashchange", redirectMovedSection);

$(() => {
  initTypedHeadline();
});

document.addEventListener("DOMContentLoaded", () => {
  initSmoothNavigation();
  initThemeToggle();
  initRecordSearch();
});
