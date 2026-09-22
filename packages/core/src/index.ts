export {
  createDiagnostic,
  hasErrors,
  mergeDiagnostics,
  type Diagnostic,
  type DiagnosticSeverity,
} from "./diagnostics.js";

export { createRandomStream, deriveStream, type RandomStream } from "./prng.js";
export { generateId, generateUniqueId } from "./ids.js";

export {
  migrateProject,
  FormatVersionError,
  InvalidFormatError,
  type MigrationResult,
} from "./migrations/index.js";

export {
  validateProject,
  validateProjectModel,
  type ValidationResult,
} from "./validation.js";

export {
  createProject,
  createDefaultParticleLayer,
  type CreateProjectOptions,
} from "./create-project.js";
