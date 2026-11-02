// Stamps the site's own version (package.json) into every page's footer at
// build time, so the published site names the version it was built from. The
// site version is independent of the record schema versions under schemas/.

import { basename } from "node:path";
import type { Plugin } from "vite";
import { escapeHtml } from "./html.ts";

const VERSION_MARKER = "<!-- build:version -->";

export function versionStamp(version: string): Plugin {
  return {
    name: "version-stamp",
    transformIndexHtml: {
      order: "pre",
      handler(html, { filename }) {
        if (!html.includes(VERSION_MARKER)) {
          throw new Error(`${basename(filename)} is missing the ${VERSION_MARKER} placeholder`);
        }
        return html.replaceAll(VERSION_MARKER, `v${escapeHtml(version)}`);
      },
    },
  };
}
