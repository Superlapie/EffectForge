/**
 * Command system stub — full implementation in Phase 2.
 * Exports types and placeholder registry for dependency graph wiring.
 */

export interface EffectForgeCommand {
  type: string;
  payload: unknown;
}

export const COMMAND_PHASE = 2 as const;
