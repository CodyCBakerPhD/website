/**
* The themes tags are grouped by, in the order the site shows them. Each value is the key that the theme's tags begin with.
*/
export enum TagTheme {
    
    /** Standards for organizing and describing data. */
    standards = "standards",
    /** File formats that data is stored in. */
    format = "format",
    /** Data archives, and the initiatives and consortia behind them. */
    archives = "archives",
    /** Preparing, describing, checking and sharing data. */
    data = "data",
    /** The species data was recorded from. */
    organisms = "organisms",
    /** How data is recorded, and the kinds of data recorded. */
    methods = "methods",
    /** Fields, theories and subjects of neuroscience research. */
    neuroscience = "neuroscience",
    /** Ways of analyzing and presenting data. */
    analysis = "analysis",
    /** How the software is built, tested and delivered. */
    engineering = "engineering",
    /** Where and at what scale the work runs. */
    computing = "computing",
    /** The main language of a software project. */
    languages = "languages",
};
/**
* Every tag a record may carry, as a theme:tag pair, listed theme by theme in the order of TagTheme.
*/
export enum Tag {
    
    /** Neurodata Without Borders, the data standard for neurophysiology. */
    standards_nwb = "standards:NWB",
    /** The Brain Imaging Data Structure, a standard for organizing datasets. */
    standards_bids = "standards:BIDS",
    /** Hierarchical Data Format 5, a file format for large arrays. */
    format_hdf5 = "format:HDF5",
    /** A chunked, compressed array format suited to cloud storage. */
    format_zarr = "format:Zarr",
    /** The DANDI Archive for neurophysiology and neuroimaging data. */
    archives_dandi = "archives:DANDI",
    /** The EMBER Archive, which holds the BBQS consortium's data. */
    archives_ember = "archives:EMBER",
    /** BossDB, a cloud archive for volumetric neuroimaging data such as electron microscopy. */
    archives_bossdb = "archives:BossDB",
    /** The Brain Behavior Quantification and Synchronization consortium. */
    archives_bbqs = "archives:BBQS",
    /** The NIH BRAIN Initiative and its consortia. */
    archives_brain_initiative = "archives:BRAIN Initiative",
    /** Converting data from acquisition or lab formats to a standard. */
    data_data_conversion = "data:Data Conversion",
    /** Designing or extending schemas for structured data. */
    data_data_standards = "data:Data Standards",
    /** Describing data so that it can be found, understood and reused. */
    data_metadata = "data:Metadata",
    /** Checking data and metadata against a standard and its best practices. */
    data_validation = "data:Validation",
    /** Recording how results were produced and from what. */
    data_provenance = "data:Provenance",
    /** Making data findable, accessible, interoperable and reusable. */
    data_fair_data = "data:FAIR Data",
    /** Data released publicly for anyone to use. */
    data_open_data = "data:Open Data",
    /** Publishing and distributing data to other researchers. */
    data_data_sharing = "data:Data Sharing",
    /** The house mouse, Mus musculus. */
    organisms_mouse = "organisms:Mouse",
    /** The zebrafish, Danio rerio. */
    organisms_zebrafish = "organisms:Zebrafish",
    /** The nematode Caenorhabditis elegans. */
    organisms_c_elegans = "organisms:C. elegans",
    /** Recording neural activity with electrodes outside the cells. */
    methods_extracellular_electrophysiology = "methods:Extracellular Electrophysiology",
    /** Optical recording of neural activity through calcium indicators. */
    methods_calcium_imaging = "methods:Calcium Imaging",
    /** Imaging at many depths to capture a volume of tissue. */
    methods_volumetric_imaging = "methods:Volumetric Imaging",
    /** Imaging of tissue structure at nanometer resolution. */
    methods_electron_microscopy = "methods:Electron Microscopy",
    /** Controlling neural activity with light. */
    methods_optogenetics = "methods:Optogenetics",
    /** Recording and quantifying what an animal does. */
    methods_behavior = "methods:Behavior",
    /** Virtual environments that respond to a behaving animal. */
    methods_virtual_reality = "methods:Virtual Reality",
    /** Recording, encoding and handling video. */
    methods_video = "methods:Video",
    /** Mathematical and computational models of the nervous system. */
    neuroscience_computational_neuroscience = "neuroscience:Computational Neuroscience",
    /** Infrastructure for organizing, sharing and analyzing neuroscience data. */
    neuroscience_neuroinformatics = "neuroscience:Neuroinformatics",
    /** Models of networks of spiking neurons. */
    neuroscience_spiking_neural_networks = "neuroscience:Spiking Neural Networks",
    /** Networks in which excitation and inhibition approximately cancel. */
    neuroscience_balanced_networks = "neuroscience:Balanced Networks",
    /** The pattern of synaptic connections between neurons. */
    neuroscience_synaptic_connectivity = "neuroscience:Synaptic Connectivity",
    /** Activity-dependent changes in synaptic strength. */
    neuroscience_synaptic_plasticity = "neuroscience:Synaptic Plasticity",
    /** Correlated variability in neural activity, such as between spike trains. */
    neuroscience_correlations = "neuroscience:Correlations",
    /** The cortical areas that process vision. */
    neuroscience_visual_cortex = "neuroscience:Visual Cortex",
    /** The non-neuronal cells of the nervous system. */
    neuroscience_glia = "neuroscience:Glia",
    /** Assigning extracellularly recorded spikes to individual neurons. */
    analysis_spike_sorting = "analysis:Spike Sorting",
    /** Plotting and interactive exploration of data. */
    analysis_data_visualization = "analysis:Data Visualization",
    /** Summarizing usage or activity logs into statistics. */
    analysis_analytics = "analysis:Analytics",
    /** Models that learn from data. */
    analysis_machine_learning = "analysis:Machine Learning",
    /** Learning structure from unlabeled data. */
    analysis_unsupervised_learning = "analysis:Unsupervised Learning",
    /** Designing programming interfaces for other developers. */
    engineering_api_design = "engineering:API Design",
    /** Tools run from a terminal. */
    engineering_command_line = "engineering:Command Line",
    /** Applications that run in a web browser. */
    engineering_web_apps = "engineering:Web Apps",
    /** Graphical interfaces for people who do not write code. */
    engineering_user_interface = "engineering:User Interface",
    /** Shaping software around how people use it, informed by user testing. */
    engineering_user_experience = "engineering:User Experience",
    /** Automated unit, integration and end-to-end tests. */
    engineering_testing = "engineering:Testing",
    /** Measuring and comparing performance. */
    engineering_benchmarking = "engineering:Benchmarking",
    /** Building and testing automatically on every change. */
    engineering_continuous_integration = "engineering:Continuous Integration",
    /** Workflows run by GitHub's automation platform. */
    engineering_github_actions = "engineering:GitHub Actions",
    /** Scheduled or event-driven jobs that run without manual steps. */
    engineering_automation = "engineering:Automation",
    /** Measuring the time, CPU and memory that programs use. */
    engineering_resource_monitoring = "engineering:Resource Monitoring",
    /** Running or storing work on cloud services. */
    computing_cloud_computing = "computing:Cloud Computing",
    /** Amazon Web Services, including S3 storage. */
    computing_aws = "computing:AWS",
    /** High-performance computing clusters and their job schedulers. */
    computing_hpc = "computing:HPC",
    /** Splitting work across processes or machines. */
    computing_parallel_computing = "computing:Parallel Computing",
    /** Multi-step processing workflows run over many datasets. */
    computing_data_pipelines = "computing:Data Pipelines",
    /** The Python programming language. */
    languages_python = "languages:Python",
    /** The JavaScript programming language. */
    languages_javascript = "languages:JavaScript",
    /** The TypeScript programming language. */
    languages_typescript = "languages:TypeScript",
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
 * The fields every record has.
 */
export interface BaseRecord {
    /** Version of this schema the record was written against. The record may still be valid under other schema versions; this names the version at the time it was written. */
    schema_version: string,
    /** Version of the record's own content, bumped whenever the record changes. */
    record_version: string,
    /** Display name of the record. */
    name: string,
    /** Keywords for the topics, methods and technologies of the work, each a theme:tag pair from the vocabulary in schemas/tags.yaml, e.g. "standards:NWB". */
    tags: Tag[],
}


/**
 * A software project and the role held on it. Each record is one JSON file under projects/.
 */
export interface Project extends BaseRecord {
    /** Role held on the project, e.g. "Lead Developer" or "Contributor". */
    role: string,
    /** Paragraphs of plain text describing the project and the contributions made to it, in which **double asterisks** mark emphasis. */
    description: string[],
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
}


/**
 * A dataset, or collection of datasets, curated for publication and the role held in curating it. Each record is one JSON file under datasets/.
 */
export interface Dataset extends BaseRecord {
    /** Role held in curating the data, e.g. "Primary Engineer" or "Supervisor". */
    role: string,
    /** Paragraphs of plain text describing the curation work, in which **double asterisks** mark emphasis. */
    description: string[],
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
    kind: PublicationKind,
    /** Authors in citation order, as initials and surname, e.g. "C. J. Gillon". Lists only the leading authors when et_al is true. */
    authors: string[],
    /** Whether further authors follow those listed. */
    et_al?: boolean,
    /** When the work was published or presented, or last dated while in preparation. */
    date: string,
    /** Where the work appeared, as cited after its title and without a trailing period: the journal and issue, the conference, or the event and its host, e.g. "eNeuro, vol. 12, no. 11". "In preparation" for a manuscript not yet published. */
    venue: string,
    /** A remark on how the work was presented or selected, without a trailing period, e.g. "Poster (top 43% of abstracts)". */
    note?: string,
    /** The work's DOI, as a link, e.g. "https://doi.org/10.25080/cehj4257". */
    doi?: string,
}



