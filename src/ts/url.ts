// The page's query string, which keeps a view's settings (the search, the
// order, the column count) so the view can be linked to.

/**
 * Rewrites the named keys of the page's query string, removing those whose
 * value is null, without adding a history entry. Every named key is deleted
 * before any is set, so a rewritten key moves to the end, after keys other
 * parts of the page keep.
 */
export function replaceQuery(changes: Readonly<Record<string, string | null>>): void {
  const next = new URLSearchParams(window.location.search);
  for (const key of Object.keys(changes)) {
    next.delete(key);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value !== null) {
      next.set(key, value);
    }
  }
  const search = next.toString();
  history.replaceState(history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
}
