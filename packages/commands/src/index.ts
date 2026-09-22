export {
  EffectForgeCommandSchema,
  SetProjectNameCommandSchema,
  AddLayerCommandSchema,
  RemoveLayerCommandSchema,
  SetLayerPropertyCommandSchema,
  SetParticleParameterCommandSchema,
  BeginTransactionCommandSchema,
  CommitTransactionCommandSchema,
  RollbackTransactionCommandSchema,
} from "./schema.js";

export type {
  EffectForgeCommand,
  SetProjectNameCommand,
  AddLayerCommand,
  RemoveLayerCommand,
  SetLayerPropertyCommand,
  SetParticleParameterCommand,
} from "./schema.js";

export { CommandError, LayerNotFoundError, TransactionError } from "./errors.js";
export { validateCommand, executeCommand, type CommandExecutionResult } from "./execute.js";
export {
  createHistoryState,
  recordHistoryEntry,
  canUndo,
  canRedo,
  undoProject,
  redoProject,
  type CommandHistoryState,
  type HistoryEntry,
} from "./history.js";
export { CommandSession, type CommandSessionOptions, type CommandSessionResult } from "./session.js";
