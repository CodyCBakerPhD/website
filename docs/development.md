# Development

## Records

Parts of the site are generated from machine-readable JSON records, one file per record:

| Records                            | LinkML class  | Site section         |
|------------------------------------|---------------|----------------------|
| [`projects/`](../projects)         | `Project`     | Highlighted Projects |
| [`datasets/`](../datasets)         | `Dataset`     | Data Curation        |
| [`publications/`](../publications) | `Publication` | Publications         |

Records hold only facts about the work.
How the site presents them, such as the order each section lists them in, is set in [`src/build/sections.ts`](../src/build/sections.ts), so a new record must also be added to its section's list there.
A record's file name is its ID.
The Publications section groups its records under a heading per `kind` (article, presentation or workshop), keeping the display order within each group.

## Tags

Every record carries `tags` from one central vocabulary, [`schemas/tags.yaml`](../schemas/tags.yaml), which groups them by theme (one LinkML enum per theme).
`linkml-validate` and the site build both reject a tag that is not in it, and the build also rejects a tag repeated within a record.

The site shows each tag as a label reading `theme | tag`, colored by its theme, with themes in the order of the table below.
The theme labels and their order are set in [`src/build/tags.ts`](../src/build/tags.ts), and their colors (steps of the colorblind-safe viridis palette) in [`src/public/css/custom.css`](../src/public/css/custom.css).

To add a tag, list it in `schemas/tags.yaml` under its theme with a one-line meaning, bump the schema version and regenerate (see [Schema](#schema)), which rewrites the table below.
A new theme also needs a label in `src/build/tags.ts` and a color in the stylesheet.
Take each record's tags from a source you can name, such as the record's own text or the repository it links to.

The table is generated from `schemas/tags.yaml`, so edit that file rather than the table.

<!-- tags:start -->
| Theme                    | Tag                               | Meaning                                                                  |
|--------------------------|-----------------------------------|--------------------------------------------------------------------------|
| Standards and formats    | `NWB`                             | Neurodata Without Borders, the data standard for neurophysiology.        |
|                          | `BIDS`                            | The Brain Imaging Data Structure, a standard for organizing datasets.    |
|                          | `HDF5`                            | Hierarchical Data Format 5, a file format for large arrays.              |
|                          | `Zarr`                            | A chunked, compressed array format suited to cloud storage.              |
| Archives and initiatives | `DANDI`                           | The DANDI Archive for neurophysiology and neuroimaging data.             |
|                          | `EMBER`                           | The EMBER Archive, which holds the BBQS consortium's data.               |
|                          | `BBQS`                            | The Brain Behavior Quantification and Synchronization consortium.        |
|                          | `BRAIN Initiative`                | The NIH BRAIN Initiative and its consortia.                              |
| Data management          | `Data Conversion`                 | Converting data from acquisition or lab formats to a standard.           |
|                          | `Data Standards`                  | Designing or extending schemas for structured data.                      |
|                          | `Metadata`                        | Describing data so that it can be found, understood and reused.          |
|                          | `Validation`                      | Checking data and metadata against a standard and its best practices.    |
|                          | `Provenance`                      | Recording how results were produced and from what.                       |
|                          | `FAIR Data`                       | Making data findable, accessible, interoperable and reusable.            |
|                          | `Open Data`                       | Data released publicly for anyone to use.                                |
|                          | `Data Sharing`                    | Publishing and distributing data to other researchers.                   |
| Organisms                | `Mouse`                           | The house mouse, Mus musculus.                                           |
|                          | `Zebrafish`                       | The zebrafish, Danio rerio.                                              |
|                          | `C. elegans`                      | The nematode Caenorhabditis elegans.                                     |
| Experimental methods     | `Extracellular Electrophysiology` | Recording neural activity with electrodes outside the cells.             |
|                          | `Calcium Imaging`                 | Optical recording of neural activity through calcium indicators.         |
|                          | `Volumetric Imaging`              | Imaging at many depths to capture a volume of tissue.                    |
|                          | `Electron Microscopy`             | Imaging of tissue structure at nanometer resolution.                     |
|                          | `Optogenetics`                    | Controlling neural activity with light.                                  |
|                          | `Behavior`                        | Recording and quantifying what an animal does.                           |
|                          | `Virtual Reality`                 | Virtual environments that respond to a behaving animal.                  |
|                          | `Video`                           | Recording, encoding and handling video.                                  |
| Neuroscience             | `Computational Neuroscience`      | Mathematical and computational models of the nervous system.             |
|                          | `Neuroinformatics`                | Infrastructure for organizing, sharing and analyzing neuroscience data.  |
|                          | `Spiking Neural Networks`         | Models of networks of spiking neurons.                                   |
|                          | `Balanced Networks`               | Networks in which excitation and inhibition approximately cancel.        |
|                          | `Synaptic Connectivity`           | The pattern of synaptic connections between neurons.                     |
|                          | `Synaptic Plasticity`             | Activity-dependent changes in synaptic strength.                         |
|                          | `Correlations`                    | Correlated variability in neural activity, such as between spike trains. |
|                          | `Visual Cortex`                   | The cortical areas that process vision.                                  |
|                          | `Glia`                            | The non-neuronal cells of the nervous system.                            |
| Analysis                 | `Spike Sorting`                   | Assigning extracellularly recorded spikes to individual neurons.         |
|                          | `Data Visualization`              | Plotting and interactive exploration of data.                            |
|                          | `Analytics`                       | Summarizing usage or activity logs into statistics.                      |
|                          | `Machine Learning`                | Models that learn from data.                                             |
|                          | `Unsupervised Learning`           | Learning structure from unlabeled data.                                  |
| Software engineering     | `API Design`                      | Designing programming interfaces for other developers.                   |
|                          | `Command Line`                    | Tools run from a terminal.                                               |
|                          | `Web Apps`                        | Applications that run in a web browser.                                  |
|                          | `User Interface`                  | Graphical interfaces for people who do not write code.                   |
|                          | `User Experience`                 | Shaping software around how people use it, informed by user testing.     |
|                          | `Testing`                         | Automated unit, integration and end-to-end tests.                        |
|                          | `Benchmarking`                    | Measuring and comparing performance.                                     |
|                          | `Continuous Integration`          | Building and testing automatically on every change.                      |
|                          | `GitHub Actions`                  | Workflows run by GitHub's automation platform.                           |
|                          | `Automation`                      | Scheduled or event-driven jobs that run without manual steps.            |
|                          | `Resource Monitoring`             | Measuring the time, CPU and memory that programs use.                    |
| Computing infrastructure | `Cloud Computing`                 | Running or storing work on cloud services.                               |
|                          | `AWS`                             | Amazon Web Services, including S3 storage.                               |
|                          | `HPC`                             | High-performance computing clusters and their job schedulers.            |
|                          | `Parallel Computing`              | Splitting work across processes or machines.                             |
|                          | `Data Pipelines`                  | Multi-step processing workflows run over many datasets.                  |
| Programming languages    | `Python`                          | The Python programming language.                                         |
|                          | `JavaScript`                      | The JavaScript programming language.                                     |
|                          | `TypeScript`                      | The TypeScript programming language.                                     |
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

`npm run build` (and `npm run dev`) also validates every record and renders each section into `index.html` as static HTML.
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

The site version is stamped at the bottom left of the page at build time.
The `Check version bumps` workflow fails a pull request that changes any of these without increasing its version.
