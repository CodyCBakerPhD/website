#!/usr/bin/env sh
# Regenerates every artifact derived from the LinkML schema (schemas/records.yaml,
# which imports schemas/tags.yaml): the JSON Schemas the site build validates
# records against, the TypeScript record types its renderers use (with two
# fixes to gen-typescript's output, see postprocess_typescript.py), and the
# tag table in docs/development.md. Requires LinkML: pip install -r schemas/requirements.txt
set -eu
cd "$(dirname "$0")/.."

gen-json-schema --top-class Project schemas/records.yaml > schemas/jsonschema/project.schema.json
gen-json-schema --top-class Dataset schemas/records.yaml > schemas/jsonschema/dataset.schema.json
gen-json-schema --top-class Publication schemas/records.yaml > schemas/jsonschema/publication.schema.json
gen-typescript schemas/records.yaml > src/build/generated/records.ts
python3 scripts/postprocess_typescript.py schemas/records.yaml src/build/generated/records.ts
python3 scripts/generate_tag_table.py
