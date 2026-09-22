export type DiagnosticSeverity = "info" | "warning" | "error";

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  path?: string;
  suggestion?: string;
}

export function createDiagnostic(
  code: string,
  severity: DiagnosticSeverity,
  message: string,
  options?: { path?: string; suggestion?: string },
): Diagnostic {
  return {
    code,
    severity,
    message,
    path: options?.path,
    suggestion: options?.suggestion,
  };
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === "error");
}

export function mergeDiagnostics(...groups: Diagnostic[][]): Diagnostic[] {
  return groups.flat();
}
