# Development

## Pages

Each HTML file directly under [`src/`](../src) is one page of the site:

| Page                 | Holds                                   |
|----------------------|-----------------------------------------|
| `index.html`         | About, Education, Skills and Experience |
| `projects.html`      | Highlighted Projects                    |
| `publications.html`  | Publications                            |
| `data-curation.html` | Data Curation                           |

The parts every page shares live in [`src/partials/`](../src/partials) and are filled in at build time where a page marks them: `<!-- build:head -->` at the top of `<head>`, then `<!-- build:header -->` and `<!-- build:footer -->` in `<body>`.
The navigation links are listed in [`src/build/layout.ts`](../src/build/layout.ts), which renders them for each page, in both the navigation bar and the footer, marking the page that is open.
A new page needs those three placeholders and, to be reachable, a link there.
The site links to each page by its address without `.html` (`projects` for `projects.html`), which GitHub Pages and Vite's servers both resolve to the page's file; `pageRoute` in `layout.ts` gives it.

The site's own styles are in [`src/css/custom.css`](../src/css/custom.css), which the shared `<head>` links, so Vite bundles and minifies it at build time.
Edit it directly; there is no minified copy to keep in step.
Everything under [`src/public/`](../src/public), such as images and the vendored Kube and Font Awesome stylesheets, is copied into the site as it is.
The vendored files are kept as downloaded, with one exception: `font-awesome.min.css` names only the WOFF copy of its icon font, the format every browser the site supports loads, so the older formats are not shipped.

## Records

Parts of the site are generated from machine-readable JSON records, one file per record:

| Records                            | LinkML class  | Section (page)                         |
|------------------------------------|---------------|----------------------------------------|
| [`summaries/`](../summaries)       | `Summary`     | About (`index.html`)                   |
| [`education/`](../education)       | `Education`   | Education (`index.html`)               |
| [`skills/`](../skills)             | `SkillGroup`  | Technical Skills (`index.html`)        |
| [`experience/`](../experience)     | `Position`    | Experience (`index.html`)              |
| [`projects/`](../projects)         | `Project`     | Highlighted Projects (`projects.html`) |
| [`datasets/`](../datasets)         | `Dataset`     | Data Curation (`data-curation.html`)   |
| [`publications/`](../publications) | `Publication` | Publications (`publications.html`)     |

Records hold only facts about the work.
How the site presents them, such as the page each section is on, is set in [`src/build/sections.ts`](../src/build/sections.ts).
The order each section lists its records in is in [`src/build/display-order.json`](../src/build/display-order.json), which the full CV follows too, so a new record must also be added to its section's list there.
Each section's `grid` lays its cards out in up to `columns` equal columns, in display order, row by row, dropping columns where a card would get narrower than `minCardWidth` pixels, so a phone shows one ([`src/build/grid.ts`](../src/build/grid.ts)).
Cards in a row share its height, and pages of cards in a grid run wider than the home page.
A section with `choices` also gets a Columns control beside its search bar, for choosing between those column counts ([`src/ts/grid.ts`](../src/ts/grid.ts)).
It disables the counts the window is too narrow for, hides itself where only one column fits, and keeps a choice other than `columns` in the page's URL, such as `projects?columns=4`.
A record's file name is its ID, and its card on the page takes the same ID, so `projects#neuroconv` opens the NeuroConv card.
IDs are lowercase kebab-case, words of letters and digits joined by hyphens such as `visual-coding-ophys`, the form other records name them by, and the build fails on a file named any other way.
Selecting a card, anywhere but on its links and tags, or the link icon in its top right corner, puts its ID in the page's URL and highlights it, without scrolling, so the address bar holds a link to that card ([`src/ts/cards.ts`](../src/ts/cards.ts)).
The Publications section groups its records under a heading per `kind` (article, presentation or workshop), keeping the display order within each group, which has a grid of its own.

A summary is the few paragraphs that introduce the site's owner, written in implied first person.
The About section shows one of them, named by `show` in `sections.ts`, rather than a card for each.
The full CV and the one-page resume render their Summary from these records too, each choosing its own in `cv/records.toml`, and the one-page resume shows only the first sentence of each paragraph (see [CV and resume](#cv-and-resume)).

Education, skills and experience are listed in display order on the home page, without the cards, search and links of the other sections.
A degree, a group of skills or a position is one record each, so the full CV and the one-page resume show the same facts, worded the same way, as the home page.
Each skill is written the way its makers spell it, such as `TypeScript`, `scikit-learn` or `pandas`.

## Links between records

A record can name other records, by the path of their file without `.json`, such as `projects/neuroconv`:

| Slot          | On                    | Means                                              | Shown on its card | Shown on the named card |
|---------------|-----------------------|----------------------------------------------------|-------------------|-------------------------|
| `about`       | Publication           | the work the publication presents or teaches       | Featured software | Presented in            |
| `built_with`  | Project, Dataset      | the software it was built with, or converted with  | Related software  | Used by                 |
| `replaced_by` | Project               | the work that has largely replaced it              | Replaced by       | Replaces                |

For example, `publications/neuroconv-2025.json` names the project it is about:

```json
"about": ["projects/neuroconv"]
```

A publication's `about` links are headed by the type of record they name: "Featured software" for projects, "Featured data" for datasets.

Write each link once, on the record that makes it.
The build lists it on both cards, linking each to the other, so the NeuroConv card lists the article under "Presented in" without its record saying so.
A card shows the first five links under a heading and folds any more behind a toggle, as it does for the records NeuroConv is "Used by".
Links from other records follow the display order in `display-order.json`, so it is the first of those that show.
The build fails on a link to a record that does not exist, to the record itself, or listed twice.
[`src/build/references.ts`](../src/build/references.ts) checks and renders the links, and each section in `sections.ts` sets the icon and text of links to its records.

## Evidence

Any record can cite `evidence`: links to sources outside the site that back up what it says.

```json
"evidence": [
  "https://github.com/hdmf-dev/hdmf/pull/672",
  "https://usage.dandiarchive.org"
]
```

Good evidence is the pull requests behind a contribution, or a page a record's description mentions.
Records hold only the URL.
Cards show a pull request or issue on GitHub as a featured or related contribution, with its title fetched from GitHub (see [GitHub activity](#github-activity)), and list the rest under "Sources" by their address, such as `usage.dandiarchive.org`.
The build fails if a record cites the same URL twice.

Like every other part of a record, links and evidence come from a source you can name, such as a project's dependency list, a publication's title, or the pull request itself.

## Logos

A project's `logo` is shown at the top of its card, from a file under [`src/public/img/`](../src/public/img).
A project that publishes its own version of its logo for dark backgrounds, such as the `prefers-color-scheme: dark` source in its README, names it in `logo_dark`, and the dark theme shows that one instead:

```json
"logo": "img/historia_logo.svg",
"logo_dark": "img/historia_logo_dark.svg"
```

In the dark theme the project cards share one navy background, set in [`src/css/custom.css`](../src/css/custom.css), except HEARTH's, which takes the dark theme of its own site. Links keep the site's colors on every card.
A logo drawn in dark blues for light backgrounds, with no dark version, sits on a light tile there instead, listed in [`src/build/projects.ts`](../src/build/projects.ts).

## Distribution

A project that others install or use lists where it is distributed in `distributions`, by the URL of each place, and a project that is not distributed (such as one run only from its source) omits it:

```json
"distributions": [
  "https://pypi.org/project/hdmf/",
  "https://anaconda.org/conda-forge/hdmf"
]
```

Its card lists them under "Distributed by", named by the package index or registry each URL is on: PyPI, conda-forge, npm, GitHub Container Registry (`https://ghcr.io/owner/image`), GitHub Releases or GitHub.
Any other URL, such as a web app, is named by its host.
[`src/build/distributions.ts`](../src/build/distributions.ts) recognizes them, and the Projects search filters on them with `distributed:`.
Take each from a source you can name, such as the package index itself or the project's installation instructions.

## Repositories

A project made of several GitHub repositories lists them in `repositories`, each with its logo if it has one:

```json
"repositories": [
  { "url": "https://github.com/brain-bbqs/bbqs-uploader", "logo": "img/bbqs_uploader_logo.svg" },
  { "url": "https://github.com/brain-bbqs/bbqs-web-components" }
]
```

Its card shows each as a small card with its logo (or GitHub's repository icon) and its description, which is fetched from GitHub (see [GitHub activity](#github-activity)).
The small cards sit in a mini grid of the same kind as the cards' own, set in [`src/build/references.ts`](../src/build/references.ts): up to two websites or three repositories side by side, each at least 160 pixels wide, with its text under its logo when there is no room beside it.
On a card narrower than 600 pixels, such as one of three or four columns, its labels sit above what they label rather than beside it, which leaves the mini grids more room.
A repository that serves a web app or site names it as its `homepage`, with a `title` for the site (such as its own page title), and the card lists it under "Websites" instead, by that title and linking there:

```json
{
  "url": "https://github.com/dandi/usage-page",
  "title": "Dandiset Usage Summaries",
  "logo": "img/dandi_usage_logo.svg",
  "homepage": "https://usage.dandiarchive.org"
}
```

The build fails on a repository with a `homepage` but no `title`.

A project whose `url` is not on GitHub, such as Neurosift's web app, names its code here too.

## GitHub activity

Cards show three kinds of activity on GitHub:

- **Featured contributions**: each pull request or issue a record cites as evidence, as a small card with its title and, for a pull request, its added and deleted lines, in GitHub's green and red with its five-block diffstat.
  Each is taken to have landed, as nearly all have, so a card does not show whether it was merged, closed or is still open.
  Feature fewer than 10; the build fails on more.
- **Related contributions**: on a project, the pull requests and issues it cites from outside its own code, such as a change to a standard it follows, shown the same way.
- **Contributions**: on a project whose code is on GitHub, three counts there, each a tile linking to the GitHub search that lists them:
  - **Pull requests merged**: the owner's pull requests that were merged, counting those they opened or were assigned.
  - **Pull requests reviewed**: other pull requests the owner reviewed, that they neither opened nor were assigned.
  - **Issues closed**: the owner's issues that were closed, counting those they opened or were assigned.

  These show once the owner's own merged pull requests or closed issues reach 10, when there are too many to feature one by one; reviews do not count toward that, and a count of zero gets no tile.
  The searches use GitHub's advanced search syntax (`OR` and parentheses), which the file records with each count.

A project's code is its `url`, when that is a GitHub repository or organization, together with its `repositories`.

The activity, and the description of each repository a project lists, is fetched into [`src/build/generated/github.json`](../src/build/generated/github.json), so building the site needs no network.
After citing a new pull request or issue, listing a repository, or adding a project, fetch it again, with a GitHub token for the higher rate limit:

```bash
GITHUB_TOKEN=$(gh auth token) python scripts/fetch_github_activity.py
```

Rerun it now and then to refresh the counts; the file records when it was fetched.
The build fails on a cited pull request or issue, a listed repository, or a project with code on GitHub, that the file has nothing for.
[`src/build/github.ts`](../src/build/github.ts) checks and renders the activity.

## Data sizes

The sizes of published data that Data Curation records give are counted by [`scripts/count_published_data.py`](../scripts/count_published_data.py), from the dandisets the owner has published on the DANDI Archive.
The build does not read its output, so when a total changes, update the record by hand.
A record whose dandisets the script does not count (those not listed in its `RECORD_DANDISET_IDS`, such as a curation the owner supervised or one not yet published) gives instead the size DANDI reports for the version it links to.
A run reads every NWB file, so it takes a while, and needs a DANDI API key in `DANDI_API_KEY`:

```bash
pip install dandi h5py remfile
```

```bash
read -rs DANDI_API_KEY && export DANDI_API_KEY
```

```bash
python scripts/count_published_data.py
```

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
The search and the order are kept in the page's URL, such as `publications?q=kind:workshop+cosyne&sort=newest`, so a view can be linked to.

Each record type's filters and orders are set beside its renderer, such as `projectSearch` in [`src/build/projects.ts`](../src/build/projects.ts).
The search bar's markup is rendered by [`src/build/search.ts`](../src/build/search.ts), and the searching runs in the browser, in [`src/ts/search.ts`](../src/ts/search.ts).
The settings and record data the build hands the browser are typed once, in [`src/ts/search-protocol.ts`](../src/ts/search-protocol.ts), which both sides import, so `npm run typecheck` fails if one side changes them without the other.
How a search splits into terms and compares them is in [`src/ts/search-terms.ts`](../src/ts/search-terms.ts), apart from the page.

## Tags

Every record carries `tags` from one central vocabulary, [`schemas/tags.yaml`](../schemas/tags.yaml).
Each tag is written as a flat `theme:tag` pair, such as `standards:NWB` or `languages:Python`.
The vocabulary lists every tag in one LinkML enum, `Tag`, theme by theme, and names the themes (the keys before the `:`) in a second enum, `TagTheme`.
`linkml-validate` and the site build both reject a tag that is not in the vocabulary, and the build also rejects a tag repeated within a record.

The site shows each tag as a label reading `theme | tag`, colored by its theme, with themes in the order of the table below.
Theme colors (steps of the colorblind-safe viridis palette) are set in [`src/css/custom.css`](../src/css/custom.css), keyed by each theme's key, and [`src/build/tags.ts`](../src/build/tags.ts) renders the labels.

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
|                          | `data:Reproducibility`                    | Keeping a result's data, code and environment together so that it can be rerun.       |
|                          | `data:FAIR Data`                          | Making data findable, accessible, interoperable and reusable.                         |
|                          | `data:Open Data`                          | Data released publicly for anyone to use.                                             |
|                          | `data:Data Sharing`                       | Publishing and distributing data to other researchers.                                |
| Organisms                | `organisms:Mouse`                         | The house mouse, Mus musculus.                                                        |
|                          | `organisms:Rat`                           | The brown rat, Rattus norvegicus.                                                     |
|                          | `organisms:Zebrafish`                     | The zebrafish, Danio rerio.                                                           |
|                          | `organisms:C. elegans`                    | The nematode Caenorhabditis elegans.                                                  |
|                          | `organisms:Rhesus Macaque`                | The rhesus macaque, Macaca mulatta.                                                   |
|                          | `organisms:Zebra Finch`                   | The zebra finch, Taeniopygia guttata, a songbird.                                     |
|                          | `organisms:Drosophila`                    | The fruit fly, Drosophila melanogaster.                                               |
|                          | `organisms:Human`                         | Humans, Homo sapiens.                                                                 |
| Experimental methods     | `methods:Extracellular Electrophysiology` | Recording neural activity with electrodes outside the cells.                          |
|                          | `methods:Calcium Imaging`                 | Optical recording of neural activity through calcium indicators.                      |
|                          | `methods:Fiber Photometry`                | Recording fluorescence from a population of cells through an implanted optical fiber. |
|                          | `methods:Patch-seq`                       | Patch-clamp recording of a cell combined with sequencing its RNA.                     |
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
Its classes map onto [schema.org](https://schema.org/) terms (`Project` is a `schema:SoftwareSourceCode`, `Dataset` a `schema:Dataset`, `Publication` a `schema:CreativeWork`, `Education` a `schema:EducationalOccupationalCredential`, `Position` a `schema:EmployeeRole`, `SkillGroup` a `schema:DefinedTermSet`, and tags are `schema:keywords`).

Three kinds of files are generated from it and committed, so building the site needs no Python:

- [`schemas/jsonschema/`](../schemas/jsonschema): one JSON Schema per record type, which the site build validates every record against.
- [`src/build/generated/records.ts`](../src/build/generated/records.ts): the TypeScript types the renderers use.
- The [tag table](#tags) in this file.

Never edit them by hand.
LinkML writes every class into every JSON Schema, so each file under `schemas/jsonschema/` is long and a new class grows all of them.
[`.gitattributes`](../.gitattributes) marks them and `src/build/generated/` as generated, so GitHub collapses them in pull request diffs.
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

```bash
linkml-validate --schema schemas/records.yaml --target-class Summary summaries/*.json
```

```bash
linkml-validate --schema schemas/records.yaml --target-class Education education/*.json
```

```bash
linkml-validate --schema schemas/records.yaml --target-class Position experience/*.json
```

```bash
linkml-validate --schema schemas/records.yaml --target-class SkillGroup skills/*.json
```

`npm run build` (and `npm run dev`) also validates every record and renders each section into its page as static HTML.
An invalid record fails the build with a message naming the file and the problem.

## CV and resume

The home page offers a full CV and a one-page resume for download, built from the same records as the pages, so the three always say the same thing.
Their LaTeX sources live under [`cv/`](../cv):

| Path                                                          | What                                                                                    |
|---------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [`cv/full_styled/`](../cv/full_styled)                        | The full CV (A4): its document, and its hand-written achievements                      |
| [`cv/one_page/`](../cv/one_page)                              | The one-page resume (Letter), condensed from the full CV                                |
| [`cv/resume_settings.sty`](../cv/resume_settings.sty)         | The macros both use (`\cvtitle`, `cvitems` and the like), which set how they look       |
| [`cv/contact.tex`](../cv/contact.tex)                         | The contact details both headers show, each laid out as its own header arranges them    |
| [`cv/records.toml`](../cv/records.toml)                       | Which records each rubric shows, in what order, and which it leaves out                 |

Every rubric but the full CV's Achievements is rendered from the records by [`scripts/render_cv.py`](../scripts/render_cv.py), and none of them is committed.
The full CV's sections, other than its Summary, say `show = "site"`, so they show every record in the website's display order.
In every other section of `cv/records.toml`, each record must be shown or left out, so adding a record means placing it there too; until then, rendering fails and names it.
The one-page resume shows only the first sentence of each project, dataset and summary description, chooses which bullets of each position and which skills of each group to show with `parts`, and its build fails if it runs onto a second page.

The `Build the CV and resume` action ([`.github/actions/build-cv/`](../.github/actions/build-cv/action.yml)) renders the rubrics, compiles both with TeX Live, and places the PDFs under `src/public/assets/resume/` (also not committed) for the site build to publish.
The deploy, every pull request preview and the daily link check run it before building the site, so a record that breaks either document fails its pull request.
They share those steps through the `Build the site` action ([`.github/actions/build-site/`](../.github/actions/build-site/action.yml)), and every workflow that needs Node takes its version from [`configs/.node-version`](../configs/.node-version).
To build them locally, with Python 3.11 or later and TeX Live with `latexmk`:

```bash
python3 scripts/render_cv.py
(cd cv/full_styled && latexmk -pdf -interaction=nonstopmode cody_c_baker_full_cv.tex)
(cd cv/one_page && latexmk -pdf -interaction=nonstopmode cody_c_baker_resume.tex)
```

Copy the two PDFs into `src/public/assets/resume/` for the dev server to offer them.
The resumes tailored to particular applications, and the plain-text ATS resume, are kept in CodyCBakerPhD/job-applications.

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

## Link checking

The `Daily link checker` workflow builds the site every day and checks every link on its pages, and in the Markdown documentation, with [lychee](https://github.com/lycheeverse/lychee).
When a link is broken, it emails the failure from the Gmail account in the `MAIL_USERNAME` and `MAIL_PASSWORD` repository secrets (an [app password](https://support.google.com/accounts/answer/185833)).
It also runs, without emailing, on pull requests that change the workflow itself.
To skip a link that cannot be checked automatically, add an `--exclude` pattern for it to the workflow.
