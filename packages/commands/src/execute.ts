import type { EffectForgeProject, Layer } from "@effectforge/schema";
import { generateUniqueId, validateProjectModel } from "@effectforge/core";
import type { Diagnostic } from "@effectforge/core";
import type { EffectForgeCommand } from "./schema.js";
import { EffectForgeCommandSchema } from "./schema.js";
import { LayerNotFoundError, CommandError } from "./errors.js";
import { setNestedProperty } from "./path.js";

export interface CommandExecutionResult {
  project: EffectForgeProject;
  diagnostics: Diagnostic[];
}

function findLayerIndex(project: EffectForgeProject, layerId: string): number {
  const index = project.layers.findIndex((layer) => layer.id === layerId);
  if (index === -1) {
    throw new LayerNotFoundError(layerId);
  }
  return index;
}

function getLayer(project: EffectForgeProject, layerId: string): Layer {
  const layer = project.layers.find((l) => l.id === layerId);
  if (!layer) {
    throw new LayerNotFoundError(layerId);
  }
  return layer;
}

function touchMetadata(project: EffectForgeProject): EffectForgeProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

function assertParticleLayer(layer: Layer, layerId: string): asserts layer is Layer & { kind: "particles" } {
  if (layer.kind !== "particles") {
    throw new CommandError(
      "INVALID_LAYER_KIND",
      `Layer "${layerId}" is kind "${layer.kind}", expected "particles".`,
    );
  }
}

export function validateCommand(command: unknown): EffectForgeCommand {
  const result = EffectForgeCommandSchema.safeParse(command);
  if (!result.success) {
    throw new CommandError(
      "INVALID_COMMAND",
      result.error.issues.map((issue) => issue.message).join("; "),
    );
  }
  return result.data;
}

export function executeCommand(
  project: EffectForgeProject,
  command: EffectForgeCommand,
): CommandExecutionResult {
  let next = touchMetadata(structuredClone(project));

  switch (command.type) {
    case "SetProjectName":
      next.name = command.payload.name;
      break;

    case "SetProjectSeed":
      next.seed = command.payload.seed;
      break;

    case "AddLayer": {
      const { layer, index } = command.payload;
      if (next.layers.some((existing) => existing.id === layer.id)) {
        throw new CommandError("DUPLICATE_LAYER_ID", `Layer ID "${layer.id}" already exists.`);
      }
      const insertAt = index ?? next.layers.length;
      next.layers = [
        ...next.layers.slice(0, insertAt),
        structuredClone(layer),
        ...next.layers.slice(insertAt),
      ];
      break;
    }

    case "RemoveLayer": {
      const index = findLayerIndex(next, command.payload.layerId);
      next.layers = next.layers.filter((_, i) => i !== index);
      break;
    }

    case "DuplicateLayer": {
      const source = getLayer(next, command.payload.layerId);
      const duplicate: Layer = {
        ...structuredClone(source),
        id: generateUniqueId("layer_"),
        name: `${source.name} Copy`,
      };
      const sourceIndex = findLayerIndex(next, command.payload.layerId);
      next.layers = [
        ...next.layers.slice(0, sourceIndex + 1),
        duplicate,
        ...next.layers.slice(sourceIndex + 1),
      ];
      break;
    }

    case "ReorderLayer": {
      const fromIndex = findLayerIndex(next, command.payload.layerId);
      const toIndex = Math.min(command.payload.toIndex, next.layers.length - 1);
      const layers = [...next.layers];
      const [moved] = layers.splice(fromIndex, 1);
      if (!moved) {
        throw new LayerNotFoundError(command.payload.layerId);
      }
      layers.splice(toIndex, 0, moved);
      next.layers = layers;
      break;
    }

    case "SetLayerEnabled": {
      const index = findLayerIndex(next, command.payload.layerId);
      const current = next.layers[index];
      if (!current) break;
      next.layers[index] = { ...current, enabled: command.payload.enabled };
      break;
    }

    case "SetLayerOpacity": {
      const index = findLayerIndex(next, command.payload.layerId);
      const current = next.layers[index];
      if (!current) break;
      next.layers[index] = { ...current, opacity: command.payload.opacity };
      break;
    }

    case "SetLayerName": {
      const index = findLayerIndex(next, command.payload.layerId);
      const current = next.layers[index];
      if (!current) break;
      next.layers[index] = { ...current, name: command.payload.name };
      break;
    }

    case "SetLayerProperty": {
      const index = findLayerIndex(next, command.payload.layerId);
      const layer = next.layers[index];
      if (!layer) {
        throw new LayerNotFoundError(command.payload.layerId);
      }
      next.layers[index] = setNestedProperty(layer, command.payload.path, command.payload.value);
      break;
    }

    case "SetParticleParameter": {
      const index = findLayerIndex(next, command.payload.layerId);
      const layer = next.layers[index];
      if (!layer) {
        throw new LayerNotFoundError(command.payload.layerId);
      }
      assertParticleLayer(layer, command.payload.layerId);
      next.layers[index] = {
        ...layer,
        [command.payload.parameter]: command.payload.value,
      };
      break;
    }

    case "SetEmitterParameter": {
      const index = findLayerIndex(next, command.payload.layerId);
      const layer = next.layers[index];
      if (!layer) {
        throw new LayerNotFoundError(command.payload.layerId);
      }
      assertParticleLayer(layer, command.payload.layerId);
      next.layers[index] = {
        ...layer,
        emitter: {
          ...layer.emitter,
          [command.payload.parameter]: command.payload.value,
        },
      };
      break;
    }

    case "BeginTransaction":
    case "CommitTransaction":
    case "RollbackTransaction":
      throw new CommandError(
        "TRANSACTION_CONTROL",
        `Command "${command.type}" must be handled by CommandSession, not executeCommand.`,
      );

    default: {
      const exhaustive: never = command;
      throw new CommandError("UNKNOWN_COMMAND", `Unknown command type: ${String(exhaustive)}`);
    }
  }

  const validation = validateProjectModel(next);
  if (!validation.success || !validation.project) {
    throw new CommandError(
      "COMMAND_VALIDATION_FAILED",
      validation.diagnostics.map((d) => d.message).join("; "),
    );
  }

  return {
    project: validation.project,
    diagnostics: validation.diagnostics,
  };
}
