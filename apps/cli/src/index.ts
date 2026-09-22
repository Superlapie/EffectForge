#!/usr/bin/env node
import { createProject, validateProject } from "@effectforge/core";
import { CURRENT_FORMAT_VERSION, FORMAT_NAME } from "@effectforge/schema";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`EffectForge CLI v0.1.0

Usage:
  effectforge validate <project.json>   Validate a project JSON file
  effectforge inspect                   Print format info
  effectforge create                    Create a sample project JSON

Full CLI commands arrive in Phase 19.
`);
}

async function main(): Promise<void> {
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  if (command === "inspect") {
    console.log(JSON.stringify({ format: FORMAT_NAME, formatVersion: CURRENT_FORMAT_VERSION }, null, 2));
    process.exit(0);
  }

  if (command === "create") {
    const project = createProject({ name: "Sample Effect" });
    console.log(JSON.stringify(project, null, 2));
    process.exit(0);
  }

  if (command === "validate") {
    const filePath = args[1];
    if (!filePath) {
      console.error("Error: missing project file path");
      process.exit(1);
    }

    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(filePath, "utf-8");
    const doc = JSON.parse(raw) as Record<string, unknown>;
    const result = validateProject(doc);

    if (result.success) {
      console.log("Project is valid.");
      process.exit(0);
    }

    console.error("Validation failed:");
    for (const d of result.diagnostics) {
      console.error(`  [${d.severity}] ${d.code}: ${d.message}`);
    }
    process.exit(1);
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unexpected error");
  process.exit(1);
});
