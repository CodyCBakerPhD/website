# www.codycbakerphd.com

Personal website of Cody C. Baker, Ph.D.

## Records

Parts of the site are generated from machine-readable JSON records, one file per record, each validated against a
JSON Schema in [`schemas/`](schemas):

| Records                    | Schema                                                          | Site section         |
|----------------------------|-----------------------------------------------------------------|----------------------|
| [`projects/`](projects)    | [`schemas/project.schema.json`](schemas/project.schema.json)    | Highlighted Projects |

To add or edit an entry, change the JSON file; each record's `$schema` key lets editors such as VS Code validate and
autocomplete it as you type. Entries are listed by ascending `priority`.

`npm run build` (and `npm run dev`) validates every record and renders the section into `index.html` as static HTML.
An invalid record fails the build with a message naming the file and the problem.
