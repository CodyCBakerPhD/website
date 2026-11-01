# Agent instructions

## Commits and pull requests

- Run the checks under [Verifying a change](#verifying-a-change) before committing and pushing, and make sure they pass.
- PR titles should be human-readable and in the past tense. They should NOT use conventional commit style.
- Every commit must include a `Co-Authored-By` trailer identifying the tool and the model that wrote it.

## Writing style

- Keep inline comments sparse. Explain non-obvious "why", never "what".
- Avoid excessive em-dashes in written text, such as documentation, comments and PR descriptions. Prefer commas, parentheses or separate sentences.

## Records and schemas

- [`docs/development.md`](docs/development.md) explains how the records, schemas and build fit together. Keep `README.md` to the short project description.
- Site content beyond the page structure lives in JSON records, one file per record, under `projects/` and `datasets/`.
- Every record is validated against a versioned schema at `schemas/<type>/<version>.schema.json` and declares that version in `schemaVersion`.
- A schema version never changes once merged. To change a schema, add a new version file following semantic versioning, move the records to it (`$schema` and `schemaVersion`), and update the version pinned in `src/build/sections.ts`.
- Records describe the work, not how this site shows it. Display order, sizing and other presentation choices belong in `src/build/` (the section lists in `sections.ts` and the renderers).
- Record text is plain text, with `**double asterisks**` for emphasis. Renderers pass it through the helpers in `src/build/html.ts` and never concatenate it into HTML unescaped.
- Never invent record content such as dates, roles or contributions. Take it from a source you can name, and say where it came from.

## Verifying a change

```bash
npm ci
npm run typecheck
npm run build
```

Then run `npm run dev` and look at the page.
