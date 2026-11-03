// Where a project is distributed for others to install or use. Records hold
// only the URL; cards name each by the package index or registry it is on, or
// else by its host, as for a web app.

import { escapeHtml } from "./html.ts";
import { renderIcon, type IconName } from "./icons.ts";

interface Channel {
  /** Matches the URL without its scheme. */
  address: RegExp;
  name: string;
  icon: IconName;
}

// The first match wins, so GitHub's releases come before GitHub itself.
const CHANNELS: readonly Channel[] = [
  { address: /^pypi\.org\/project\/[^/]+\/?$/, name: "PyPI", icon: "pypi" },
  { address: /^anaconda\.org\/conda-forge\/[^/]+\/?$/, name: "conda-forge", icon: "conda-forge" },
  { address: /^(www\.)?npmjs\.com\/(package|org)\/.+$/, name: "npm", icon: "npm" },
  { address: /^ghcr\.io\/[^/]+\/[^/]+\/?$/, name: "GitHub Container Registry", icon: "container" },
  { address: /^github\.com\/[^/]+\/[^/]+\/releases\/?$/, name: "GitHub Releases", icon: "github" },
  { address: /^github\.com\/[^/]+(\/[^/]+)?\/?$/, name: "GitHub", icon: "github" },
];

function channelOf(url: string): { name: string; icon: IconName } {
  const address = url.replace(/^https?:\/\//, "");
  return CHANNELS.find((channel) => channel.address.test(address)) ?? { name: new URL(url).host.replace(/^www\./, ""), icon: "globe" };
}

/** "PyPI" for https://pypi.org/project/hdmf/, or the host of a web app, e.g. "neurosift.app". */
export function distributionName(url: string): string {
  return channelOf(url).name;
}

/** A link to where the project is distributed, named by its channel. */
export function renderDistribution(url: string): string {
  const { name, icon } = channelOf(url);
  return `${renderIcon(icon)} <span><a href="${escapeHtml(url)}" title="${escapeHtml(url)}">${escapeHtml(name)}</a></span>`;
}
