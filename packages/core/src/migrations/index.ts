import {
  CURRENT_FORMAT_VERSION,
  FORMAT_NAME,
  type UnknownProjectDocument,
} from "@effectforge/schema";
import { createDiagnostic, type Diagnostic } from "../diagnostics.js";

export interface MigrationResult {
  document: UnknownProjectDocument;
  diagnostics: Diagnostic[];
}

type MigrationFn = (doc: UnknownProjectDocument) => MigrationResult;

/**
 * Migration registry. Add new migrations here as formatVersion increments.
 * Each migration transforms version N -> N+1.
 */
const migrations: Record<number, MigrationFn> = {
  // Example for future use:
  // 1: (doc) => ({ document: { ...doc, formatVersion: 2, newField: 'default' }, diagnostics: [] }),
};

export class FormatVersionError extends Error {
  readonly code = "FORMAT_VERSION_UNSUPPORTED";
  readonly documentVersion: number;
  readonly supportedVersion: number;

  constructor(documentVersion: number, supportedVersion: number) {
    super(
      `Project format version ${documentVersion} is not supported. ` +
        `This application supports up to version ${supportedVersion}.`,
    );
    this.name = "FormatVersionError";
    this.documentVersion = documentVersion;
    this.supportedVersion = supportedVersion;
  }
}

export class InvalidFormatError extends Error {
  readonly code = "INVALID_FORMAT";

  constructor(message: string) {
    super(message);
    this.name = "InvalidFormatError";
  }
}

function getDocumentVersion(doc: UnknownProjectDocument): number {
  const version = doc["formatVersion"];
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new InvalidFormatError(
      "Project document is missing a valid formatVersion field.",
    );
  }
  return version;
}

/**
 * Migrate a raw project document to the current format version.
 * Never mutates unknown future formats — throws if document is newer than supported.
 */
export function migrateProject(doc: UnknownProjectDocument): MigrationResult {
  if (doc["format"] !== FORMAT_NAME) {
    throw new InvalidFormatError(
      `Expected format "${FORMAT_NAME}", got "${String(doc["format"])}".`,
    );
  }

  let version = getDocumentVersion(doc);
  const diagnostics: Diagnostic[] = [];
  let current = { ...doc };

  if (version > CURRENT_FORMAT_VERSION) {
    throw new FormatVersionError(version, CURRENT_FORMAT_VERSION);
  }

  while (version < CURRENT_FORMAT_VERSION) {
    const migration = migrations[version];
    if (!migration) {
      throw new InvalidFormatError(
        `No migration path from format version ${version} to ${CURRENT_FORMAT_VERSION}.`,
      );
    }
    const result = migration(current);
    current = result.document;
    diagnostics.push(...result.diagnostics);
    diagnostics.push(
      createDiagnostic(
        "MIGRATION_APPLIED",
        "info",
        `Migrated project from format version ${version} to ${version + 1}.`,
      ),
    );
    version = getDocumentVersion(current);
  }

  return { document: current, diagnostics };
}
