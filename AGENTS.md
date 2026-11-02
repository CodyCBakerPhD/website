# Agent instructions

## Commits and pull requests

- Run the checks under [Verifying a change](#verifying-a-change) before committing and pushing, and make sure they pass.
- PR titles should be human-readable and in the past tense. They should NOT use conventional commit style.
- Every commit must include a `Co-Authored-By` trailer identifying the tool and the model that wrote it.

## Versioning

Three versions are bumped independently, each once per PR and following semantic versioning. The `Check version bumps` workflow enforces all three. Follow-up commits on the same unmerged PR do not bump again.

- The site: `version` in `package.json`, stamped at the bottom left of the page. Bump it when the PR changes the built site: anything under `src/`, `configs/`, `projects/`, `datasets/`, `publications/` or `schemas/`, or `package.json`/`package-lock.json` themselves. Do NOT bump it for changes that are purely documentation or CI, such as `docs/`, `README.md`, `AGENTS.md` or `.github/`.
- The schema: `version` in `schemas/records.yaml`. Bump it when the schema changes.
- Each record: its `record_version`. Bump it when the record changes.

## Writing style

- Keep inline comments sparse. Explain non-obvious "why", never "what".
- Avoid excessive em-dashes in written text, such as documentation, comments and PR descriptions. Prefer commas, parentheses or separate sentences.
- Use American English spelling everywhere (code, comments, page text, records and PR descriptions): "normalize" not "normalise", "color" not "colour", "behavior" not "behaviour". Proper names keep their own spelling, e.g. "Sainsbury Wellcome Centre".

## Records and schemas

- [`docs/development.md`](docs/development.md) explains how the records, schemas and build fit together. Keep `README.md` to the short project description.
- Site content beyond the page structure lives in JSON records, one file per record, under `projects/`, `datasets/` and `publications/`. A record's file name is its ID: keep it when the record's wording changes.
- The LinkML schema `schemas/records.yaml` is the source of truth for every record's shape. Never edit the files generated from it (`schemas/jsonschema/` and `src/build/generated/`); change the schema, then run `sh scripts/generate-schemas.sh`.
- Each record names the schema version it was written against in `schema_version`, and its own content version in `record_version`.
- Records describe the work, not how this site shows it. Display order, sizing and other presentation choices belong in `src/build/` (the section lists in `sections.ts` and the renderers).
- Record text is plain text, with `**double asterisks**` for emphasis. Renderers pass it through the helpers in `src/build/html.ts` and never concatenate it into HTML unescaped.
- Never invent record content such as dates, roles, contributions or tags. Take it from a source you can name, and say where it came from.
- Every record has `tags`. Reuse the spelling of a tag already used by another record where one fits, rather than coining a near-duplicate.

## Verifying a change

```bash
npm ci
npm run typecheck
npm run build
```

After changing the schema or any record, also run LinkML (`pip install -r schemas/requirements.txt`):

```bash
linkml-lint schemas/records.yaml
linkml-validate --schema schemas/records.yaml --target-class Project projects/*.json
linkml-validate --schema schemas/records.yaml --target-class Dataset datasets/*.json
linkml-validate --schema schemas/records.yaml --target-class Publication publications/*.json
sh scripts/generate-schemas.sh
```
