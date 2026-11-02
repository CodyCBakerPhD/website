#!/usr/bin/env sh
# Regenerates every artifact derived from the LinkML schema (schemas/records.yaml):
# the JSON Schemas the site build validates records against, and the TypeScript
# record types its renderers use. Requires LinkML: pip install -r schemas/requirements.txt
set -eu
cd "$(dirname "$0")/.."

gen-json-schema --top-class Project schemas/records.yaml > schemas/jsonschema/project.schema.json
gen-json-schema --top-class Dataset schemas/records.yaml > schemas/jsonschema/dataset.schema.json
gen-json-schema --top-class Publication schemas/records.yaml > schemas/jsonschema/publication.schema.json
gen-typescript schemas/records.yaml > src/build/generated/records.ts
