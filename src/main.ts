// Site behavior for index.html: the animated "typed" headline, smooth
// scrolling for the fixed navigation bar, and the light/dark theme toggle.
// Compiled to dist/js/main.js.

/** Fallback when the nav bar has not rendered yet (matches its CSS height). */
const DEFAULT_NAV_OFFSET_PX = 80;

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

function initTypedHeadline(): void {
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

$(() => {
  initTypedHeadline();
});

document.addEventListener("DOMContentLoaded", () => {
  initSmoothNavigation();
  initThemeToggle();
});
