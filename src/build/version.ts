// Stamps the site's own version (package.json) into index.html at build time,
// so the published page names the version it was built from. The site version
// is independent of the record schema versions under schemas/.

import type { Plugin } from "vite";
import { escapeHtml } from "./html.ts";

const VERSION_MARKER = "<!-- build:version -->";

export function versionStamp(version: string): Plugin {
  return {
    name: "version-stamp",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes(VERSION_MARKER)) {
          throw new Error(`index.html is missing the ${VERSION_MARKER} placeholder`);
        }
        return html.replaceAll(VERSION_MARKER, `v${escapeHtml(version)}`);
      },
    },
  };
}
