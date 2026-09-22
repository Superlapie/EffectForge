export class CommandError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CommandError";
    this.code = code;
  }
}

export class LayerNotFoundError extends CommandError {
  readonly layerId: string;

  constructor(layerId: string) {
    super("LAYER_NOT_FOUND", `Layer "${layerId}" was not found.`);
    this.name = "LayerNotFoundError";
    this.layerId = layerId;
  }
}

export class TransactionError extends CommandError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = "TransactionError";
  }
}
