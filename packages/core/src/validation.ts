import {
  EffectForgeProjectSchema,
  type EffectForgeProject,
  type UnknownProjectDocument,
} from "@effectforge/schema";
import { createDiagnostic, mergeDiagnostics, type Diagnostic } from "./diagnostics.js";
import { migrateProject, FormatVersionError, InvalidFormatError } from "./migrations/index.js";

export interface ValidationResult {
  success: boolean;
  project?: EffectForgeProject;
  diagnostics: Diagnostic[];
}

function validateLayerReferences(project: EffectForgeProject): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const layerIds = new Set(project.layers.map((l) => l.id));

  for (const layer of project.layers) {
    if (layer.kind === "group") {
      for (const childId of layer.childLayerIds) {
        if (!layerIds.has(childId)) {
          diagnostics.push(
            createDiagnostic(
              "LAYER_REFERENCE_MISSING",
              "error",
              `Group "${layer.name}" references missing layer "${childId}".`,
              { path: `layers.${layer.id}.childLayerIds` },
            ),
          );
        }
      }
    }

    if (layer.kind === "model" && !project.assets[layer.modelAssetId]) {
      diagnostics.push(
        createDiagnostic(
          "ASSET_REFERENCE_MISSING",
          "error",
          `Model layer "${layer.name}" references missing asset "${layer.modelAssetId}".`,
          { path: `layers.${layer.id}.modelAssetId` },
        ),
      );
    }

    if (layer.kind === "distortion" && layer.sourceAssetId) {
      if (!project.assets[layer.sourceAssetId]) {
        diagnostics.push(
          createDiagnostic(
            "ASSET_REFERENCE_MISSING",
            "warning",
            `Distortion layer "${layer.name}" references missing asset "${layer.sourceAssetId}".`,
            { path: `layers.${layer.id}.sourceAssetId` },
          ),
        );
      }
    }
  }

  const duplicateIds = findDuplicateLayerIds(project.layers);
  for (const id of duplicateIds) {
    diagnostics.push(
      createDiagnostic(
        "DUPLICATE_LAYER_ID",
        "error",
        `Duplicate layer ID "${id}" found.`,
        { path: "layers" },
      ),
    );
  }

  return diagnostics;
}

function findDuplicateLayerIds(layers: EffectForgeProject["layers"]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const layer of layers) {
    if (seen.has(layer.id)) {
      duplicates.add(layer.id);
    }
    seen.add(layer.id);
  }
  return [...duplicates];
}

/**
 * Parse and validate a raw project document, applying migrations if needed.
 */
export function validateProject(doc: UnknownProjectDocument): ValidationResult {
  const diagnostics: Diagnostic[] = [];

  try {
    const migrationResult = migrateProject(doc);
    diagnostics.push(...migrationResult.diagnostics);

    const parseResult = EffectForgeProjectSchema.safeParse(migrationResult.document);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        diagnostics.push(
          createDiagnostic(
            "SCHEMA_VALIDATION_ERROR",
            "error",
            issue.message,
            { path: issue.path.join(".") },
          ),
        );
      }
      return { success: false, diagnostics };
    }

    const semanticDiagnostics = validateLayerReferences(parseResult.data);
    diagnostics.push(...semanticDiagnostics);

    const hasError = diagnostics.some((d) => d.severity === "error");
    return {
      success: !hasError,
      project: parseResult.data,
      diagnostics,
    };
  } catch (error) {
    if (error instanceof FormatVersionError) {
      diagnostics.push(
        createDiagnostic("FORMAT_VERSION_UNSUPPORTED", "error", error.message, {
          suggestion: "Update EffectForge to a newer version that supports this project.",
        }),
      );
    } else if (error instanceof InvalidFormatError) {
      diagnostics.push(createDiagnostic("INVALID_FORMAT", "error", error.message));
    } else if (error instanceof Error) {
      diagnostics.push(createDiagnostic("VALIDATION_ERROR", "error", error.message));
    } else {
      diagnostics.push(
        createDiagnostic("VALIDATION_ERROR", "error", "Unknown validation error."),
      );
    }
    return { success: false, diagnostics };
  }
}

/** Validate an already-parsed project (e.g. after command mutations). */
export function validateProjectModel(project: EffectForgeProject): ValidationResult {
  const parseResult = EffectForgeProjectSchema.safeParse(project);
  if (!parseResult.success) {
    const diagnostics = parseResult.error.issues.map((issue) =>
      createDiagnostic("SCHEMA_VALIDATION_ERROR", "error", issue.message, {
        path: issue.path.join("."),
      }),
    );
    return { success: false, diagnostics };
  }

  const semanticDiagnostics = validateLayerReferences(parseResult.data);
  const hasError = semanticDiagnostics.some((d) => d.severity === "error");

  return {
    success: !hasError,
    project: parseResult.data,
    diagnostics: semanticDiagnostics,
  };
}

export { mergeDiagnostics };
