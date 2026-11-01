# Development

## Records

Parts of the site are generated from machine-readable JSON records, one file per record.
Each record is validated against a versioned JSON Schema in [`schemas/`](../schemas):

| Records                    | Schema                                                                      | Site section         |
|----------------------------|-----------------------------------------------------------------------------|----------------------|
| [`projects/`](../projects) | [`schemas/project/0.1.0.schema.json`](../schemas/project/0.1.0.schema.json) | Highlighted Projects |
| [`datasets/`](../datasets) | [`schemas/dataset/0.1.0.schema.json`](../schemas/dataset/0.1.0.schema.json) | Data Curation        |

To add or edit an entry, change its JSON file.
Each record's `$schema` key lets editors such as VS Code validate and autocomplete it as you type.
Records hold only facts about the work. How the site presents them, such as the order each section lists them in, is set in [`src/build/sections.ts`](../src/build/sections.ts), so a new record must also be added to its section's list there.

`npm run build` (and `npm run dev`) validates every record and renders each section into `index.html` as static HTML.
An invalid record fails the build with a message naming the file and the problem.

## Schema versions

Every record declares the schema version it follows in `schemaVersion`, and the site renders one version per record type.
A released schema version never changes.
To evolve a schema, add a new version file following [semantic versioning](https://semver.org), move the records to it (`$schema` and `schemaVersion`), and update the version pinned in `src/build/sections.ts`.
