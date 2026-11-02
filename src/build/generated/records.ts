

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
    /** Role held on the work the record describes. */
    role: string,
    /** Paragraphs of plain text, in which **double asterisks** mark emphasis. */
    description: string[],
}


/**
 * A software project and the role held on it. Each record is one JSON file under projects/.
 */
export interface Project extends BaseRecord {
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



