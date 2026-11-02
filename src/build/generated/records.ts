/**
* Data standards and the file formats they build on.
*/
export enum StandardTag {
    
    /** Neurodata Without Borders, the data standard for neurophysiology. */
    NWB = "NWB",
    /** The Brain Imaging Data Structure, a standard for organizing datasets. */
    BIDS = "BIDS",
    /** Hierarchical Data Format 5, a file format for large arrays. */
    HDF5 = "HDF5",
    /** A chunked, compressed array format suited to cloud storage. */
    Zarr = "Zarr",
};
/**
* Data archives, and the initiatives and consortia behind them.
*/
export enum ArchiveTag {
    
    /** The DANDI Archive for neurophysiology and neuroimaging data. */
    DANDI = "DANDI",
    /** The EMBER Archive, which holds the BBQS consortium's data. */
    EMBER = "EMBER",
    /** The Brain Behavior Quantification and Synchronization consortium. */
    BBQS = "BBQS",
    /** The NIH BRAIN Initiative and its consortia. */
    BRAIN_Initiative = "BRAIN Initiative",
};
/**
* Preparing, describing, checking and sharing data.
*/
export enum DataManagementTag {
    
    /** Converting data from acquisition or lab formats to a standard. */
    Data_Conversion = "Data Conversion",
    /** Designing or extending schemas for structured data. */
    Data_Standards = "Data Standards",
    /** Describing data so that it can be found, understood and reused. */
    Metadata = "Metadata",
    /** Checking data and metadata against a standard and its best practices. */
    Validation = "Validation",
    /** Recording how results were produced and from what. */
    Provenance = "Provenance",
    /** Making data findable, accessible, interoperable and reusable. */
    FAIR_Data = "FAIR Data",
    /** Data released publicly for anyone to use. */
    Open_Data = "Open Data",
    /** Publishing and distributing data to other researchers. */
    Data_Sharing = "Data Sharing",
};
/**
* The species data was recorded from.
*/
export enum OrganismTag {
    
    /** The house mouse, Mus musculus. */
    Mouse = "Mouse",
    /** The zebrafish, Danio rerio. */
    Zebrafish = "Zebrafish",
    /** The nematode Caenorhabditis elegans. */
    CFULL_STOP_elegans = "C. elegans",
};
/**
* How data is recorded, and the kinds of data recorded.
*/
export enum MethodTag {
    
    /** Recording neural activity with electrodes outside the cells. */
    Extracellular_Electrophysiology = "Extracellular Electrophysiology",
    /** Optical recording of neural activity through calcium indicators. */
    Calcium_Imaging = "Calcium Imaging",
    /** Imaging at many depths to capture a volume of tissue. */
    Volumetric_Imaging = "Volumetric Imaging",
    /** Imaging of tissue structure at nanometer resolution. */
    Electron_Microscopy = "Electron Microscopy",
    /** Controlling neural activity with light. */
    Optogenetics = "Optogenetics",
    /** Recording and quantifying what an animal does. */
    Behavior = "Behavior",
    /** Virtual environments that respond to a behaving animal. */
    Virtual_Reality = "Virtual Reality",
    /** Recording, encoding and handling video. */
    Video = "Video",
};
/**
* Fields, theories and subjects of neuroscience research.
*/
export enum NeuroscienceTag {
    
    /** Mathematical and computational models of the nervous system. */
    Computational_Neuroscience = "Computational Neuroscience",
    /** Infrastructure for organizing, sharing and analyzing neuroscience data. */
    Neuroinformatics = "Neuroinformatics",
    /** Models of networks of spiking neurons. */
    Spiking_Neural_Networks = "Spiking Neural Networks",
    /** Networks in which excitation and inhibition approximately cancel. */
    Balanced_Networks = "Balanced Networks",
    /** The pattern of synaptic connections between neurons. */
    Synaptic_Connectivity = "Synaptic Connectivity",
    /** Activity-dependent changes in synaptic strength. */
    Synaptic_Plasticity = "Synaptic Plasticity",
    /** Correlated variability in neural activity, such as between spike trains. */
    Correlations = "Correlations",
    /** The cortical areas that process vision. */
    Visual_Cortex = "Visual Cortex",
    /** The non-neuronal cells of the nervous system. */
    Glia = "Glia",
};
/**
* Ways of analyzing and presenting data.
*/
export enum AnalysisTag {
    
    /** Assigning extracellularly recorded spikes to individual neurons. */
    Spike_Sorting = "Spike Sorting",
    /** Plotting and interactive exploration of data. */
    Data_Visualization = "Data Visualization",
    /** Summarizing usage or activity logs into statistics. */
    Analytics = "Analytics",
    /** Models that learn from data. */
    Machine_Learning = "Machine Learning",
    /** Learning structure from unlabeled data. */
    Unsupervised_Learning = "Unsupervised Learning",
};
/**
* How the software is built, tested and delivered.
*/
export enum EngineeringTag {
    
    /** Designing programming interfaces for other developers. */
    API_Design = "API Design",
    /** Tools run from a terminal. */
    Command_Line = "Command Line",
    /** Applications that run in a web browser. */
    Web_Apps = "Web Apps",
    /** Graphical interfaces for people who do not write code. */
    User_Interface = "User Interface",
    /** Shaping software around how people use it, informed by user testing. */
    User_Experience = "User Experience",
    /** Automated unit, integration and end-to-end tests. */
    Testing = "Testing",
    /** Measuring and comparing performance. */
    Benchmarking = "Benchmarking",
    /** Building and testing automatically on every change. */
    Continuous_Integration = "Continuous Integration",
    /** Workflows run by GitHub's automation platform. */
    GitHub_Actions = "GitHub Actions",
    /** Scheduled or event-driven jobs that run without manual steps. */
    Automation = "Automation",
    /** Measuring the time, CPU and memory that programs use. */
    Resource_Monitoring = "Resource Monitoring",
};
/**
* Where and at what scale the work runs.
*/
export enum ComputingTag {
    
    /** Running or storing work on cloud services. */
    Cloud_Computing = "Cloud Computing",
    /** Amazon Web Services, including S3 storage. */
    AWS = "AWS",
    /** High-performance computing clusters and their job schedulers. */
    HPC = "HPC",
    /** Splitting work across processes or machines. */
    Parallel_Computing = "Parallel Computing",
    /** Multi-step processing workflows run over many datasets. */
    Data_Pipelines = "Data Pipelines",
};
/**
* The main language of a software project.
*/
export enum LanguageTag {
    
    /** The Python programming language. */
    Python = "Python",
    /** The JavaScript programming language. */
    JavaScript = "JavaScript",
    /** The TypeScript programming language. */
    TypeScript = "TypeScript",
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
    /** Keywords for the topics, methods and technologies of the work, each taken from the vocabulary in schemas/tags.yaml. */
    tags: string[],
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
    kind: string,
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



