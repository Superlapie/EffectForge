export const ARCHIVE_VERSION = 1;
export const PROJECT_JSON_PATH = "project.json";
export const METADATA_JSON_PATH = "metadata.json";

/** Maximum compressed archive size accepted on unpack. */
export const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;

/** Maximum total uncompressed bytes across all entries. */
export const MAX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024;

/** Maximum bytes for a single archive entry. */
export const MAX_ENTRY_BYTES = 25 * 1024 * 1024;

/** Maximum number of files inside an archive. */
export const MAX_ENTRY_COUNT = 500;

export const EFFECTFORGE_PACKAGE_VERSION = "0.1.0";
