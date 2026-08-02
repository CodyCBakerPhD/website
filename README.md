# www.codycbakerphd.com

Personal website of Cody C. Baker, Ph.D.

The site lives in `docs/` (static assets) and `src/` (TypeScript, compiled with `tsc` — no Jekyll).

## Development

```bash
npm ci
npm run build   # assembles the deployable site into dist/
npm run serve   # preview dist/ locally
```

## Deployment

Pushes to `main` deploy `dist/` to the `gh-pages` branch via `.github/workflows/deploy_site.yml`.
Pull requests get a live preview at `pr-preview/pr-<number>/` on `gh-pages` via `.github/workflows/preview_site.yml`.

GitHub Pages serves the `gh-pages` branch from its root. The custom domain is set by `docs/CNAME`,
which ships with every deploy. See `docs/README.md` for the Namecheap DNS setup.
