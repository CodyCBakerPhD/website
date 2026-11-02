# Development

## Pages

Each HTML file directly under [`src/`](../src) is one page of the site:

| Page                 | Holds                                   |
|----------------------|-----------------------------------------|
| `index.html`         | About, Education, Skills and Experience |
| `projects.html`      | Highlighted Projects                    |
| `data-curation.html` | Data Curation                           |
| `publications.html`  | Publications                            |

The parts every page shares live in [`src/partials/`](../src/partials) and are filled in at build time where a page marks them: `<!-- build:head -->` at the top of `<head>`, then `<!-- build:header -->` and `<!-- build:footer -->` in `<body>`.
The navigation links are listed in [`src/build/layout.ts`](../src/build/layout.ts), which renders them for each page, in both the navigation bar and the footer, marking the page that is open.
A new page needs those three placeholders and, to be reachable, a link there.

## Records

Parts of the site are generated from machine-readable JSON records, one file per record:

| Records                            | LinkML class  | Section (page)                         |
|------------------------------------|---------------|----------------------------------------|
| [`projects/`](../projects)         | `Project`     | Highlighted Projects (`projects.html`) |
| [`datasets/`](../datasets)         | `Dataset`     | Data Curation (`data-curation.html`)   |
| [`publications/`](../publications) | `Publication` | Publications (`publications.html`)     |

Records hold only facts about the work.
How the site presents them, such as the page each section is on and the order it lists its records in, is set in [`src/build/sections.ts`](../src/build/sections.ts), so a new record must also be added to its section's list there.
A record's file name is its ID, and its card on the page takes the same ID, so `projects.html#neuroconv` opens the NeuroConv card.
The Publications section groups its records under a heading per `kind` (article, presentation or workshop), keeping the display order within each group.

## Links between records

A record can name other records, by the path of their file without `.json`, such as `projects/neuroconv`:

| Slot          | On                    | Means                                              | Shown on its card | Shown on the named card |
|---------------|-----------------------|----------------------------------------------------|-------------------|-------------------------|
| `about`       | Publication           | the work the publication presents or teaches       | About             | Featured in             |
| `built_with`  | Project, Dataset      | the software it was built with, or converted with  | Built with        | Used by                 |
| `replaced_by` | Project               | the work that has largely replaced it              | Replaced by       | Replaces                |

For example, `publications/neuroconv-2025.json` names the project it is about:

```json
"about": ["projects/neuroconv"]
```

Write each link once, on the record that makes it.
The build lists it on both cards, linking each to the other, so the NeuroConv card lists the article under "Featured in" without its record saying so.
The build fails on a link to a record that does not exist, to the record itself, or listed twice.
[`src/build/references.ts`](../src/build/references.ts) checks and renders the links, and each section in `sections.ts` sets the icon and text of links to its records.

## Evidence

Any record can cite `evidence`: sources outside the site that back up what it says, each with a `title` saying what the source is and its `url`.

```json
"evidence": [
  { "title": "GenericDataChunkIterator", "url": "https://github.com/hdmf-dev/hdmf/pull/672" }
]
```

Good evidence is the pull requests behind a contribution, the package index a project says it is published on, or a page its description mentions.
Cards list it under "Evidence", after the links to other records, and the build fails if a record cites the same URL twice.

Like every other part of a record, links and evidence come from a source you can name, such as a project's dependency list, a publication's title, or the pull request itself.

## Search

Each record section has a search bar above its records, which filters them as you type, and a menu to sort them.
A search is free text plus `key:value` filters, after [DANDI's search](https://docs.dandiarchive.org/user-guide-using/advanced-search/), and a record is shown only when every term matches:

- Free text matches a record whose card contains it, ignoring case and accents.
- Every tag theme is a filter key, matching part of a tag's name: `standards:NWB`, or `methods:imaging` for both kinds of imaging. `tag:` matches a tag of any theme.
- Each section adds filters on its records' fields, such as `role:`, `author:` or `kind:`. `year:` takes a year (`year:2024`) or a range (`year:>=2023`).
- Values with spaces are quoted: `methods:"Calcium Imaging"`.

Selecting a tag on a card adds its filter to the search, and selecting it again removes it.
The search box suggests filters, and then the values of the one being typed, with how many records have each.
A filter key it does not know is searched as text, with a suggestion for the key that was probably meant.
Sorting keeps Publications grouped by kind, ordering the publications within each group.
The search and the order are kept in the page's URL, such as `publications.html?q=kind:workshop+cosyne&sort=newest`, so a view can be linked to.

Each record type's filters and orders are set beside its renderer, such as `projectSearch` in [`src/build/projects.ts`](../src/build/projects.ts).
The search bar's markup is rendered by [`src/build/search.ts`](../src/build/search.ts), and the searching runs in the browser, in [`src/ts/search.ts`](../src/ts/search.ts).

## Tags

Every record carries `tags` from one central vocabulary, [`schemas/tags.yaml`](../schemas/tags.yaml).
Each tag is written as a flat `theme:tag` pair, such as `standards:NWB` or `languages:Python`.
The vocabulary lists every tag in one LinkML enum, `Tag`, theme by theme, and names the themes (the keys before the `:`) in a second enum, `TagTheme`.
`linkml-validate` and the site build both reject a tag that is not in the vocabulary, and the build also rejects a tag repeated within a record.

The site shows each tag as a label reading `theme | tag`, colored by its theme, with themes in the order of the table below.
Theme colors (steps of the colorblind-safe viridis palette) are set in [`src/public/css/custom.css`](../src/public/css/custom.css), keyed by each theme's key, and [`src/build/tags.ts`](../src/build/tags.ts) renders the labels.

To add a tag, list it in `Tag` among the other tags of its theme, with a one-line meaning, then bump the schema version and regenerate (see [Schema](#schema)), which rewrites the table below.
Regenerating fails if a tag's key is not in `TagTheme`, or if `Tag` strays from listing its tags theme by theme in `TagTheme`'s order.
A new theme needs an entry in `TagTheme` and a color in the stylesheet.
Take each record's tags from a source you can name, such as the record's own text or the repository it links to.

The table is generated from `schemas/tags.yaml`, so edit that file rather than the table.

<!-- tags:start -->
| Theme                    | Tag                                       | Meaning                                                                               |
|--------------------------|-------------------------------------------|---------------------------------------------------------------------------------------|
| Data standards           | `standards:NWB`                           | Neurodata Without Borders, the data standard for neurophysiology.                     |
|                          | `standards:BIDS`                          | The Brain Imaging Data Structure, a standard for organizing datasets.                 |
| File formats             | `format:HDF5`                             | Hierarchical Data Format 5, a file format for large arrays.                           |
|                          | `format:Zarr`                             | A chunked, compressed array format suited to cloud storage.                           |
| Archives and initiatives | `archives:DANDI`                          | The DANDI Archive for neurophysiology and neuroimaging data.                          |
|                          | `archives:EMBER`                          | The EMBER Archive, which holds the BBQS consortium's data.                            |
|                          | `archives:BossDB`                         | BossDB, a cloud archive for volumetric neuroimaging data such as electron microscopy. |
|                          | `archives:BBQS`                           | The Brain Behavior Quantification and Synchronization consortium.                     |
|                          | `archives:BRAIN Initiative`               | The NIH BRAIN Initiative and its consortia.                                           |
| Data management          | `data:Data Conversion`                    | Converting data from acquisition or lab formats to a standard.                        |
|                          | `data:Data Standards`                     | Designing or extending schemas for structured data.                                   |
|                          | `data:Metadata`                           | Describing data so that it can be found, understood and reused.                       |
|                          | `data:Validation`                         | Checking data and metadata against a standard and its best practices.                 |
|                          | `data:Provenance`                         | Recording how results were produced and from what.                                    |
|                          | `data:FAIR Data`                          | Making data findable, accessible, interoperable and reusable.                         |
|                          | `data:Open Data`                          | Data released publicly for anyone to use.                                             |
|                          | `data:Data Sharing`                       | Publishing and distributing data to other researchers.                                |
| Organisms                | `organisms:Mouse`                         | The house mouse, Mus musculus.                                                        |
|                          | `organisms:Zebrafish`                     | The zebrafish, Danio rerio.                                                           |
|                          | `organisms:C. elegans`                    | The nematode Caenorhabditis elegans.                                                  |
| Experimental methods     | `methods:Extracellular Electrophysiology` | Recording neural activity with electrodes outside the cells.                          |
|                          | `methods:Calcium Imaging`                 | Optical recording of neural activity through calcium indicators.                      |
|                          | `methods:Volumetric Imaging`              | Imaging at many depths to capture a volume of tissue.                                 |
|                          | `methods:Electron Microscopy`             | Imaging of tissue structure at nanometer resolution.                                  |
|                          | `methods:Optogenetics`                    | Controlling neural activity with light.                                               |
|                          | `methods:Behavior`                        | Recording and quantifying what an animal does.                                        |
|                          | `methods:Virtual Reality`                 | Virtual environments that respond to a behaving animal.                               |
|                          | `methods:Video`                           | Recording, encoding and handling video.                                               |
| Neuroscience             | `neuroscience:Computational Neuroscience` | Mathematical and computational models of the nervous system.                          |
|                          | `neuroscience:Neuroinformatics`           | Infrastructure for organizing, sharing and analyzing neuroscience data.               |
|                          | `neuroscience:Spiking Neural Networks`    | Models of networks of spiking neurons.                                                |
|                          | `neuroscience:Balanced Networks`          | Networks in which excitation and inhibition approximately cancel.                     |
|                          | `neuroscience:Synaptic Connectivity`      | The pattern of synaptic connections between neurons.                                  |
|                          | `neuroscience:Synaptic Plasticity`        | Activity-dependent changes in synaptic strength.                                      |
|                          | `neuroscience:Correlations`               | Correlated variability in neural activity, such as between spike trains.              |
|                          | `neuroscience:Visual Cortex`              | The cortical areas that process vision.                                               |
|                          | `neuroscience:Glia`                       | The non-neuronal cells of the nervous system.                                         |
| Analysis                 | `analysis:Spike Sorting`                  | Assigning extracellularly recorded spikes to individual neurons.                      |
|                          | `analysis:Data Visualization`             | Plotting and interactive exploration of data.                                         |
|                          | `analysis:Analytics`                      | Summarizing usage or activity logs into statistics.                                   |
|                          | `analysis:Machine Learning`               | Models that learn from data.                                                          |
|                          | `analysis:Unsupervised Learning`          | Learning structure from unlabeled data.                                               |
| Software engineering     | `engineering:API Design`                  | Designing programming interfaces for other developers.                                |
|                          | `engineering:Command Line`                | Tools run from a terminal.                                                            |
|                          | `engineering:Web Apps`                    | Applications that run in a web browser.                                               |
|                          | `engineering:User Interface`              | Graphical interfaces for people who do not write code.                                |
|                          | `engineering:User Experience`             | Shaping software around how people use it, informed by user testing.                  |
|                          | `engineering:Testing`                     | Automated unit, integration and end-to-end tests.                                     |
|                          | `engineering:Benchmarking`                | Measuring and comparing performance.                                                  |
|                          | `engineering:Continuous Integration`      | Building and testing automatically on every change.                                   |
|                          | `engineering:GitHub Actions`              | Workflows run by GitHub's automation platform.                                        |
|                          | `engineering:Automation`                  | Scheduled or event-driven jobs that run without manual steps.                         |
|                          | `engineering:Resource Monitoring`         | Measuring the time, CPU and memory that programs use.                                 |
| Computing infrastructure | `computing:Cloud Computing`               | Running or storing work on cloud services.                                            |
|                          | `computing:AWS`                           | Amazon Web Services, including S3 storage.                                            |
|                          | `computing:HPC`                           | High-performance computing clusters and their job schedulers.                         |
|                          | `computing:Parallel Computing`            | Splitting work across processes or machines.                                          |
|                          | `computing:Data Pipelines`                | Multi-step processing workflows run over many datasets.                               |
| Programming languages    | `languages:Python`                        | The Python programming language.                                                      |
|                          | `languages:JavaScript`                    | The JavaScript programming language.                                                  |
|                          | `languages:TypeScript`                    | The TypeScript programming language.                                                  |
<!-- tags:end -->

## Schema

The [LinkML](https://linkml.io/) schema [`schemas/records.yaml`](../schemas/records.yaml) is the source of truth for the shape of every record.
It imports the tag vocabulary, [`schemas/tags.yaml`](../schemas/tags.yaml), which is part of the same schema and shares its version.
Its classes map onto [schema.org](https://schema.org/) terms (`Project` is a `schema:SoftwareSourceCode`, `Dataset` a `schema:Dataset`, `Publication` a `schema:CreativeWork`, and tags are `schema:keywords`).

Three kinds of files are generated from it and committed, so building the site needs no Python:

- [`schemas/jsonschema/`](../schemas/jsonschema): one JSON Schema per record type, which the site build validates every record against.
- [`src/build/generated/records.ts`](../src/build/generated/records.ts): the TypeScript types the renderers use.
- The [tag table](#tags) in this file.

Never edit them by hand.
After changing the schema, regenerate them with LinkML installed:

```bash
pip install -r schemas/requirements.txt
```

```bash
sh scripts/generate-schemas.sh
```

To validate the records the way CI does:

```bash
linkml-validate --schema schemas/records.yaml --target-class Project projects/*.json
```

```bash
linkml-validate --schema schemas/records.yaml --target-class Dataset datasets/*.json
```

```bash
linkml-validate --schema schemas/records.yaml --target-class Publication publications/*.json
```

`npm run build` (and `npm run dev`) also validates every record and renders each section into its page as static HTML.
An invalid record fails the build with a message naming the file and the problem.

## Banner

The background of the "never stop learning" banner, [`src/public/img/banner.svg`](../src/public/img/banner.svg), is generated by [`scripts/generate_banner.py`](../scripts/generate_banner.py).
It is seeded, so rerunning it reproduces the same file.
To change the artwork, edit the script (its seeds, colors or growth parameters) and regenerate it, with nothing but the Python standard library:

```bash
python scripts/generate_banner.py
```

## Versions

Three things carry their own [semantic version](https://semver.org), independently of one another:

| What           | Where                               | Bump when                                     |
|----------------|-------------------------------------|-----------------------------------------------|
| The schema     | `version` in `schemas/records.yaml` | the schema, or `schemas/tags.yaml`, changes   |
| Each record    | `record_version` in the record      | the record changes                            |
| The site       | `version` in `package.json`         | anything that shapes the built site changes   |

Each record also names the schema version it was written against in `schema_version`.
It may still be valid under later schema versions, so `schema_version` only needs updating when the record is revised to follow a newer schema.

The site version is stamped at the bottom left of every page at build time.
The `Check version bumps` workflow fails a pull request that changes any of these without increasing its version.
