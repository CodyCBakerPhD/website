/**
* The themes tags are grouped by, in the order the site shows them. Each value is the key that the theme's tags begin with.
*/
export enum TagTheme {
    
    /** Standards for organizing and describing data. */
    Data_standards = "standards",
    /** File formats that data is stored in. */
    File_formats = "format",
    /** Data archives, and the initiatives and consortia behind them. */
    Archives_and_initiatives = "archives",
    /** Preparing, describing, checking and sharing data. */
    Data_management = "data",
    /** The species data was recorded from. */
    Organisms = "organisms",
    /** How data is recorded, and the kinds of data recorded. */
    Experimental_methods = "methods",
    /** Fields, theories and subjects of neuroscience research. */
    Neuroscience = "neuroscience",
    /** Ways of analyzing and presenting data. */
    Analysis = "analysis",
    /** How the software is built, tested and delivered. */
    Software_engineering = "engineering",
    /** Where and at what scale the work runs. */
    Computing_infrastructure = "computing",
    /** The main language of a software project. */
    Programming_languages = "languages",
};
/**
* Every tag a record may carry, as a theme:tag pair, listed theme by theme in the order of TagTheme.
*/
export enum Tag {
    
    /** Neurodata Without Borders, the data standard for neurophysiology. */
    standardsCOLONNWB = "standards:NWB",
    /** The Brain Imaging Data Structure, a standard for organizing datasets. */
    standardsCOLONBIDS = "standards:BIDS",
    /** Hierarchical Data Format 5, a file format for large arrays. */
    formatCOLONHDF5 = "format:HDF5",
    /** A chunked, compressed array format suited to cloud storage. */
    formatCOLONZarr = "format:Zarr",
    /** The DANDI Archive for neurophysiology and neuroimaging data. */
    archivesCOLONDANDI = "archives:DANDI",
    /** The EMBER Archive, which holds the BBQS consortium's data. */
    archivesCOLONEMBER = "archives:EMBER",
    /** BossDB, a cloud archive for volumetric neuroimaging data such as electron microscopy. */
    archivesCOLONBossDB = "archives:BossDB",
    /** The Brain Behavior Quantification and Synchronization consortium. */
    archivesCOLONBBQS = "archives:BBQS",
    /** The NIH BRAIN Initiative and its consortia. */
    archivesCOLONBRAIN_Initiative = "archives:BRAIN Initiative",
    /** Converting data from acquisition or lab formats to a standard. */
    dataCOLONData_Conversion = "data:Data Conversion",
    /** Designing or extending schemas for structured data. */
    dataCOLONData_Standards = "data:Data Standards",
    /** Describing data so that it can be found, understood and reused. */
    dataCOLONMetadata = "data:Metadata",
    /** Checking data and metadata against a standard and its best practices. */
    dataCOLONValidation = "data:Validation",
    /** Recording how results were produced and from what. */
    dataCOLONProvenance = "data:Provenance",
    /** Making data findable, accessible, interoperable and reusable. */
    dataCOLONFAIR_Data = "data:FAIR Data",
    /** Data released publicly for anyone to use. */
    dataCOLONOpen_Data = "data:Open Data",
    /** Publishing and distributing data to other researchers. */
    dataCOLONData_Sharing = "data:Data Sharing",
    /** The house mouse, Mus musculus. */
    organismsCOLONMouse = "organisms:Mouse",
    /** The zebrafish, Danio rerio. */
    organismsCOLONZebrafish = "organisms:Zebrafish",
    /** The nematode Caenorhabditis elegans. */
    organismsCOLONCFULL_STOP_elegans = "organisms:C. elegans",
    /** Recording neural activity with electrodes outside the cells. */
    methodsCOLONExtracellular_Electrophysiology = "methods:Extracellular Electrophysiology",
    /** Optical recording of neural activity through calcium indicators. */
    methodsCOLONCalcium_Imaging = "methods:Calcium Imaging",
    /** Imaging at many depths to capture a volume of tissue. */
    methodsCOLONVolumetric_Imaging = "methods:Volumetric Imaging",
    /** Imaging of tissue structure at nanometer resolution. */
    methodsCOLONElectron_Microscopy = "methods:Electron Microscopy",
    /** Controlling neural activity with light. */
    methodsCOLONOptogenetics = "methods:Optogenetics",
    /** Recording and quantifying what an animal does. */
    methodsCOLONBehavior = "methods:Behavior",
    /** Virtual environments that respond to a behaving animal. */
    methodsCOLONVirtual_Reality = "methods:Virtual Reality",
    /** Recording, encoding and handling video. */
    methodsCOLONVideo = "methods:Video",
    /** Mathematical and computational models of the nervous system. */
    neuroscienceCOLONComputational_Neuroscience = "neuroscience:Computational Neuroscience",
    /** Infrastructure for organizing, sharing and analyzing neuroscience data. */
    neuroscienceCOLONNeuroinformatics = "neuroscience:Neuroinformatics",
    /** Models of networks of spiking neurons. */
    neuroscienceCOLONSpiking_Neural_Networks = "neuroscience:Spiking Neural Networks",
    /** Networks in which excitation and inhibition approximately cancel. */
    neuroscienceCOLONBalanced_Networks = "neuroscience:Balanced Networks",
    /** The pattern of synaptic connections between neurons. */
    neuroscienceCOLONSynaptic_Connectivity = "neuroscience:Synaptic Connectivity",
    /** Activity-dependent changes in synaptic strength. */
    neuroscienceCOLONSynaptic_Plasticity = "neuroscience:Synaptic Plasticity",
    /** Correlated variability in neural activity, such as between spike trains. */
    neuroscienceCOLONCorrelations = "neuroscience:Correlations",
    /** The cortical areas that process vision. */
    neuroscienceCOLONVisual_Cortex = "neuroscience:Visual Cortex",
    /** The non-neuronal cells of the nervous system. */
    neuroscienceCOLONGlia = "neuroscience:Glia",
    /** Assigning extracellularly recorded spikes to individual neurons. */
    analysisCOLONSpike_Sorting = "analysis:Spike Sorting",
    /** Plotting and interactive exploration of data. */
    analysisCOLONData_Visualization = "analysis:Data Visualization",
    /** Summarizing usage or activity logs into statistics. */
    analysisCOLONAnalytics = "analysis:Analytics",
    /** Models that learn from data. */
    analysisCOLONMachine_Learning = "analysis:Machine Learning",
    /** Learning structure from unlabeled data. */
    analysisCOLONUnsupervised_Learning = "analysis:Unsupervised Learning",
    /** Designing programming interfaces for other developers. */
    engineeringCOLONAPI_Design = "engineering:API Design",
    /** Tools run from a terminal. */
    engineeringCOLONCommand_Line = "engineering:Command Line",
    /** Applications that run in a web browser. */
    engineeringCOLONWeb_Apps = "engineering:Web Apps",
    /** Graphical interfaces for people who do not write code. */
    engineeringCOLONUser_Interface = "engineering:User Interface",
    /** Shaping software around how people use it, informed by user testing. */
    engineeringCOLONUser_Experience = "engineering:User Experience",
    /** Automated unit, integration and end-to-end tests. */
    engineeringCOLONTesting = "engineering:Testing",
    /** Measuring and comparing performance. */
    engineeringCOLONBenchmarking = "engineering:Benchmarking",
    /** Building and testing automatically on every change. */
    engineeringCOLONContinuous_Integration = "engineering:Continuous Integration",
    /** Workflows run by GitHub's automation platform. */
    engineeringCOLONGitHub_Actions = "engineering:GitHub Actions",
    /** Scheduled or event-driven jobs that run without manual steps. */
    engineeringCOLONAutomation = "engineering:Automation",
    /** Measuring the time, CPU and memory that programs use. */
    engineeringCOLONResource_Monitoring = "engineering:Resource Monitoring",
    /** Running or storing work on cloud services. */
    computingCOLONCloud_Computing = "computing:Cloud Computing",
    /** Amazon Web Services, including S3 storage. */
    computingCOLONAWS = "computing:AWS",
    /** High-performance computing clusters and their job schedulers. */
    computingCOLONHPC = "computing:HPC",
    /** Splitting work across processes or machines. */
    computingCOLONParallel_Computing = "computing:Parallel Computing",
    /** Multi-step processing workflows run over many datasets. */
    computingCOLONData_Pipelines = "computing:Data Pipelines",
    /** The Python programming language. */
    languagesCOLONPython = "languages:Python",
    /** The JavaScript programming language. */
    languagesCOLONJavaScript = "languages:JavaScript",
    /** The TypeScript programming language. */
    languagesCOLONTypeScript = "languages:TypeScript",
};
/**
* The kinds of scholarly work a Publication can be.
*/
export enum PublicationKind {
    
    /** A journal article, conference paper or manuscript. */
    article = "article",
    /** A talk or poster at a conference. */
    presentation = "presentation",
    /** A tutorial, hackathon or workshop session led or co-led. */
    workshop = "workshop",
};


/**
 * The fields every record has, and the evidence any record may cite.
 */
export interface BaseRecord {
    /** Version of this schema the record was written against. The record may still be valid under other schema versions; this names the version at the time it was written. */
    schema_version: string,
    /** Version of the record's own content, bumped whenever the record changes. */
    record_version: string,
    /** Display name of the record. */
    name: string,
    /** Keywords for the topics, methods and technologies of the work, each a theme:tag pair from the vocabulary in schemas/tags.yaml, e.g. "standards:NWB". */
    tags: string[],
    /** Links to sources outside this site that back up what the record says, such as the pull requests behind a contribution or a page its description mentions, e.g. "https://github.com/hdmf-dev/hdmf/pull/672". What a GitHub pull request or issue is (its title and state) is fetched from GitHub rather than written here. */
    evidence?: string[],
}


/**
 * A software project and the role held on it. Each record is one JSON file under projects/.
 */
export interface Project extends BaseRecord {
    /** Role held on the project, e.g. "Lead Developer" or "Contributor". */
    role: string,
    /** Paragraphs of plain text describing the project and the contributions made to it, in which **double asterisks** mark emphasis. */
    description: string[],
    /** Other records of the software this work was built with, such as a project it depends on directly or the one that converted a dataset, e.g. "projects/neuroconv". */
    built_with?: string[],
    /** Primary link for the project, such as its source repository or homepage. */
    url: string,
    /** Summary of the contributions made to the project. Required when the role is "Contributor". */
    contribution?: string,
    /** When involvement in the project began. */
    start_date: string,
    /** When involvement in the project ended. Omitted while it is ongoing. */
    end_date?: string,
    /** Path to the project's logo relative to the website root (the file itself lives under src/public/), e.g. "img/guide_logo.png". */
    logo?: string,
    /** Where the project is distributed for others to install or use, as the page of each package index, container registry, release or web app, e.g. "https://pypi.org/project/hdmf/". The site names each by its address. */
    distributions: string[],
    /** The GitHub repositories the project is made of, each with its own logo if it has one. Its pull requests and issues there are counted toward it, as well as those under its url when that is on GitHub. */
    repositories?: Repository[],
    /** Other records of the work that has largely replaced this project, e.g. "projects/neurosift". */
    replaced_by?: string[],
}


/**
 * A dataset, or collection of datasets, curated for publication and the role held in curating it. Each record is one JSON file under datasets/.
 */
export interface Dataset extends BaseRecord {
    /** Role held in curating the data, e.g. "Primary Engineer" or "Supervisor". */
    role: string,
    /** Paragraphs of plain text describing the curation work, in which **double asterisks** mark emphasis. */
    description: string[],
    /** Other records of the software this work was built with, such as a project it depends on directly or the one that converted a dataset, e.g. "projects/neuroconv". */
    built_with?: string[],
    /** Research group that produced the data, e.g. "Leifer Lab". */
    group: string,
    /** Institution the group belongs to, e.g. "Princeton University". Omitted for groups that span several institutions. */
    institution?: string,
    /** Primary data modality, e.g. "Microscopy" or "Electrophysiology". */
    modality: string,
    /** Related resources. */
    links?: DatasetLinks,
}


/**
 * A GitHub repository that is part of a project.
 */
export interface Repository {
    /** The repository on GitHub, e.g. "https://github.com/brain-bbqs/bbqs-uploader". What it is (its description) is fetched from GitHub rather than written here. */
    url: string,
    /** Path to the repository's logo relative to the website root (the file itself lives under src/public/), e.g. "img/bbqs_uploader_logo.svg". */
    logo?: string,
    /** Where what the repository builds is served, such as its web app, when that is what to link to rather than the code, e.g. "https://dandi-compute.github.io/dandi-compute-page/". */
    homepage?: string,
}


/**
 * Resources related to a dataset, keyed by type.
 */
export interface DatasetLinks {
    /** The associated publication, ideally as a DOI link. */
    manuscript?: string,
    /** The published data, e.g. a Dandiset on the DANDI Archive. */
    dataset?: string,
    /** Jupyter Notebook(s) demonstrating how to access and analyze the data. */
    notebook?: string,
    /** Source code that converted the data to a standard format. */
    code?: string,
}


/**
 * A scholarly work: an article, a conference presentation or a workshop. Each record is one JSON file under publications/.
 */
export interface Publication extends BaseRecord {
    /** Paragraphs of plain text summarizing the work, in which **double asterisks** mark emphasis. */
    description?: string[],
    /** What kind of work it is. */
    kind: string,
    /** Authors in citation order, as initials and surname, e.g. "C. J. Gillon". Lists only the leading authors when et_al is true. */
    authors: string[],
    /** Whether further authors follow those listed. Set only for works with more than 10 authors; otherwise list every author. */
    et_al?: boolean,
    /** When the work was published or presented, or last dated while in preparation. */
    date: string,
    /** Where the work appeared, as cited after its title and without a trailing period: the journal and issue, the conference, or the event and its host, e.g. "eNeuro, vol. 12, no. 11". "In preparation" for a manuscript not yet published. */
    venue: string,
    /** A remark on how the work was presented or selected, without a trailing period, e.g. "Poster (top 43% of abstracts)". */
    note?: string,
    /** The work's DOI, as a link, e.g. "https://doi.org/10.25080/cehj4257". */
    doi?: string,
    /** Other records of the work this one presents, describes or teaches, e.g. "projects/neuroconv". */
    about?: string[],
}



