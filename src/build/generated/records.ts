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
    /** Short keywords for the topics, methods and technologies of the work, e.g. "NWB", "Data Conversion" or "Python". Records share one vocabulary, so reuse an existing tag's spelling where one fits. */
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



