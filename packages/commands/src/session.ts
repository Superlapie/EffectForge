import type { EffectForgeProject } from "@effectforge/schema";
import type { Diagnostic } from "@effectforge/core";
import { executeCommand, validateCommand } from "./execute.js";
import {
  canRedo,
  canUndo,
  createHistoryState,
  createPatches,
  recordHistoryEntry,
  redoProject,
  undoProject,
  type CommandHistoryState,
} from "./history.js";
import { TransactionError } from "./errors.js";

export interface CommandSessionOptions {
  maxHistoryEntries?: number;
}

export interface CommandSessionResult {
  project: EffectForgeProject;
  diagnostics: Diagnostic[];
}

interface ActiveTransaction {
  label?: string;
  baseProject: EffectForgeProject;
}

export class CommandSession {
  private project: EffectForgeProject;
  private history: CommandHistoryState = createHistoryState();
  private transaction: ActiveTransaction | null = null;
  private readonly maxHistoryEntries: number;

  constructor(project: EffectForgeProject, options: CommandSessionOptions = {}) {
    this.project = project;
    this.maxHistoryEntries = options.maxHistoryEntries ?? 200;
  }

  getProject(): EffectForgeProject {
    return this.project;
  }

  isInTransaction(): boolean {
    return this.transaction !== null;
  }

  canUndo(): boolean {
    return canUndo(this.history);
  }

  canRedo(): boolean {
    return canRedo(this.history);
  }

  execute(command: unknown): CommandSessionResult {
    const parsed = validateCommand(command);

    if (parsed.type === "BeginTransaction") {
      return this.beginTransaction(parsed.payload.label);
    }
    if (parsed.type === "CommitTransaction") {
      return this.commitTransaction();
    }
    if (parsed.type === "RollbackTransaction") {
      return this.rollbackTransaction();
    }

    const before = structuredClone(this.project);
    const result = executeCommand(this.project, parsed);
    this.project = result.project;

    if (!this.transaction) {
      const patchResult = createPatches(before, (draft) => {
        Object.assign(draft, structuredClone(this.project));
      });

      if (patchResult.patches.length > 0) {
        this.history = recordHistoryEntry(
          this.history,
          {
            label: parsed.type,
            patches: patchResult.patches,
            inversePatches: patchResult.inversePatches,
          },
          this.maxHistoryEntries,
        );
      }
    }

    return { project: this.project, diagnostics: result.diagnostics };
  }

  /** Apply multiple commands inside a transaction with a single undo entry. */
  executeTransaction(recipe: (session: CommandSession) => void, label?: string): CommandSessionResult {
    this.beginTransaction(label);
    try {
      recipe(this);
      return this.commitTransaction();
    } catch (error) {
      this.rollbackTransaction();
      throw error;
    }
  }

  undo(): CommandSessionResult | null {
    if (this.transaction) {
      throw new TransactionError(
        "TRANSACTION_ACTIVE",
        "Cannot undo while a transaction is active. Commit or rollback first.",
      );
    }

    const result = undoProject(this.project, this.history);
    if (!result) {
      return null;
    }

    this.project = result.project;
    this.history = result.history;
    return { project: this.project, diagnostics: [] };
  }

  redo(): CommandSessionResult | null {
    if (this.transaction) {
      throw new TransactionError(
        "TRANSACTION_ACTIVE",
        "Cannot redo while a transaction is active. Commit or rollback first.",
      );
    }

    const result = redoProject(this.project, this.history);
    if (!result) {
      return null;
    }

    this.project = result.project;
    this.history = result.history;
    return { project: this.project, diagnostics: [] };
  }

  private beginTransaction(label?: string): CommandSessionResult {
    if (this.transaction) {
      throw new TransactionError(
        "TRANSACTION_ALREADY_ACTIVE",
        "A transaction is already active. Commit or rollback before starting another.",
      );
    }

    this.transaction = {
      label,
      baseProject: structuredClone(this.project),
    };

    return { project: this.project, diagnostics: [] };
  }

  private commitTransaction(): CommandSessionResult {
    if (!this.transaction) {
      throw new TransactionError("NO_ACTIVE_TRANSACTION", "No active transaction to commit.");
    }

    const { baseProject, label } = this.transaction;
    this.transaction = null;

    const patchResult = createPatches(baseProject, (draft) => {
      Object.assign(draft, structuredClone(this.project));
    });

    if (patchResult.patches.length > 0) {
      this.history = recordHistoryEntry(
        this.history,
        { label, patches: patchResult.patches, inversePatches: patchResult.inversePatches },
        this.maxHistoryEntries,
      );
    }

    return { project: this.project, diagnostics: [] };
  }

  private rollbackTransaction(): CommandSessionResult {
    if (!this.transaction) {
      throw new TransactionError("NO_ACTIVE_TRANSACTION", "No active transaction to rollback.");
    }

    this.project = structuredClone(this.transaction.baseProject);
    this.transaction = null;

    return { project: this.project, diagnostics: [] };
  }
}
