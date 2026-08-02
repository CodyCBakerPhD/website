"use strict";
// Site behavior for index.html: the animated "typed" headline and smooth
// scrolling for the fixed navigation bar. Compiled to dist/js/main.js.
/** Fallback when the nav bar has not rendered yet (matches its CSS height). */
const DEFAULT_NAV_OFFSET_PX = 80;
function initTypedHeadline() {
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
function scrollToTarget(targetElement, navOffset) {
    // Mark only the active target so CSS can compensate for the fixed nav.
    document
        .querySelectorAll(".scroll-offset")
        .forEach((el) => el.classList.remove("scroll-offset"));
    targetElement.classList.add("scroll-offset");
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top: targetPosition, behavior: "smooth" });
}
function initSmoothNavigation() {
    const nav = document.querySelector(".main-nav");
    const navOffset = (nav === null || nav === void 0 ? void 0 : nav.offsetHeight) || DEFAULT_NAV_OFFSET_PX;
    const links = document.querySelectorAll('.navbar a[href^="#"]');
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
            const targetElement = document.querySelector(targetId);
            if (!targetElement) {
                return;
            }
            history.pushState(null, "", targetId);
            scrollToTarget(targetElement, navOffset);
        });
    });
}
$(() => {
    initTypedHeadline();
});
document.addEventListener("DOMContentLoaded", initSmoothNavigation);
