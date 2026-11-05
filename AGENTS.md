# Agent instructions

## Commits and pull requests

- Run the checks under [Verifying a change](#verifying-a-change) before committing and pushing, and make sure they pass.
- PR titles should be human-readable and in the past tense. They should NOT use conventional commit style.
- Every commit must include a `Co-Authored-By` trailer identifying the tool and the model that wrote it.

## Versioning

Three versions are bumped independently, each once per PR and following semantic versioning. The `Check version bumps` workflow enforces all three. Follow-up commits on the same unmerged PR do not bump again.

- The site: `version` in `package.json`, stamped at the bottom left of the page. Bump it when the PR changes the built site: anything under `src/`, `configs/`, `cv/`, `projects/`, `datasets/`, `publications/`, `summaries/` or `schemas/`, `scripts/render_cv.py`, or `package.json`/`package-lock.json` themselves. Do NOT bump it for changes that are purely documentation or CI, such as `docs/`, `README.md`, `AGENTS.md` or `.github/`.
- The schema: `version` in `schemas/records.yaml`. Bump it when the schema changes, including the tag vocabulary in `schemas/tags.yaml`.
- Each record: its `record_version`. Bump it when the record changes.

## Writing style

- Keep inline comments sparse. Explain non-obvious "why", never "what".
- Avoid excessive em-dashes in written text, such as documentation, comments and PR descriptions. Prefer commas, parentheses or separate sentences.
- Use American English spelling everywhere (code, comments, page text, records and PR descriptions): "normalize" not "normalise", "color" not "colour", "behavior" not "behaviour". Proper names keep their own spelling, e.g. "Sainsbury Wellcome Centre".

## Records and schemas

- [`docs/development.md`](docs/development.md) explains how the records, schemas and build fit together. Keep `README.md` to the short project description.
- Site content beyond the page structure lives in JSON records, one file per record, under `summaries/`, `projects/`, `datasets/` and `publications/`. A record's file name is its ID: keep it when the record's wording changes.
- The full CV and the one-page resume under `cv/` are rendered from the same records and built into PDFs when the site deploys; nothing they generate is committed. Every record must be shown or left out in each of their sections in `cv/records.toml`, so a new record is placed there too. The tailored and ATS resumes stay in CodyCBakerPhD/job-applications.
- The LinkML schema `schemas/records.yaml` is the source of truth for every record's shape. Never edit the files generated from it (`schemas/jsonschema/`, `src/build/generated/records.ts` and the tag table in `docs/development.md`); change the schema, then run `sh scripts/generate-schemas.sh`.
- Never edit `src/build/generated/github.json` by hand either. After citing a GitHub pull request or issue as evidence, or adding a project, run `python scripts/fetch_github_activity.py` (with `GITHUB_TOKEN` set) to fetch its activity.
- Each record names the schema version it was written against in `schema_version`, and its own content version in `record_version`.
- Records describe the work, not how this site shows it. Display order, sizing and other presentation choices belong in `src/build/` (the section lists in `sections.ts` and the renderers).
- Record text is plain text, with `**double asterisks**` for emphasis. Renderers pass it through the helpers in `src/build/html.ts` and never concatenate it into HTML unescaped.
- Never invent record content such as dates, roles, contributions or tags. Take it from a source you can name, and say where it came from.
- Link records to one another through the relation slots (`about`, `built_with`, `replaced_by`), naming each by path, e.g. `projects/neuroconv`, rather than repeating its content. Write a link once, on the record making it: the build shows it on both cards.
- Back up claims with `evidence`, links to sources outside the site such as the pull requests behind a contribution. Like the rest of a record, take links and evidence from a source you can name.
- Every record has `tags`, written as flat `theme:tag` pairs (e.g. `standards:NWB`) from the vocabulary in `schemas/tags.yaml`, which groups them by theme. Use the tags listed there; add one only when none fits, under its theme and with its meaning.

## Verifying a change

```bash
npm ci
npm run typecheck
npm run build
```

After changing the schema or any record, also run LinkML (`pip install -r schemas/requirements.txt`):

```bash
linkml-lint --config schemas/.linkmllint.yaml schemas/
linkml-validate --schema schemas/records.yaml --target-class Project projects/*.json
linkml-validate --schema schemas/records.yaml --target-class Dataset datasets/*.json
linkml-validate --schema schemas/records.yaml --target-class Publication publications/*.json
linkml-validate --schema schemas/records.yaml --target-class Summary summaries/*.json
sh scripts/generate-schemas.sh
```

After changing a record, `cv/` or `scripts/render_cv.py`, render the CV's rubrics, which fails if a record is not placed in `cv/records.toml`. Where TeX Live with `latexmk` is installed, also compile both PDFs; the one-page resume fails if it runs onto a second page:

```bash
python3 scripts/render_cv.py
(cd cv/full_styled && latexmk -pdf -interaction=nonstopmode cody_c_baker_full_cv.tex)
(cd cv/one_page && latexmk -pdf -interaction=nonstopmode cody_c_baker_resume.tex)
```
