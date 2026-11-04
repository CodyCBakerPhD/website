// Links to single record cards. Selecting a card, anywhere but on its own
// links and buttons, puts its ID in the page's URL (projects#neuroconv), as
// the link in its corner does, so the card can be linked to. The markup comes
// from renderCard in src/build/html.ts.

/** Elements that keep their own behavior when a card is clicked through them. */
const INTERACTIVE = "a, button, input, select, textarea, summary, label";

/** Puts the card's ID in the URL, which highlights the card (:target), without moving the page. */
function selectCard(card: HTMLElement): void {
  const { scrollX, scrollY } = window;
  // Replaced rather than pushed, so Back leaves the page instead of stepping through every card selected.
  window.location.replace(`#${card.id}`);
  // The card is already in view, where it was clicked, so undo the jump to it.
  window.scrollTo(scrollX, scrollY);
}

export function initCardLinks(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as Element;
    const card = target.closest<HTMLElement>("[data-card]");
    // A modified click on the corner link opens it as usual, such as in a new tab.
    if (!card || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (target.closest(".card-permalink a")) {
      event.preventDefault();
      selectCard(card);
      return;
    }
    // Releasing a drag that selected text in the card also clicks it.
    if (target.closest(INTERACTIVE) || !(window.getSelection()?.isCollapsed ?? true)) {
      return;
    }
    selectCard(card);
  });
}
