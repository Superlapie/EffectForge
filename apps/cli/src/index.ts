#!/usr/bin/env node
import { createProject, validateProject } from "@effectforge/core";
import {
  listPresets,
  packPresetBundle,
  PRESET_JSON_PATH,
  suggestPresetBundleFilename,
  unpackPresetBundle,
} from "@effectforge/presets";
import { packProject, PROJECT_JSON_PATH, unpackProject } from "@effectforge/project-format";
import { CURRENT_FORMAT_VERSION, FORMAT_NAME } from "@effectforge/schema";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`EffectForge CLI v0.1.0

Usage:
  effectforge validate <project.json>              Validate a project JSON file
  effectforge pack <project.json> [output.effectforge]
  effectforge unpack <archive.effectforge> [dir]
  effectforge preset list
  effectforge preset pack <project.json> [output.effectforge-preset]
  effectforge preset unpack <bundle.effectforge-preset> [dir]
  effectforge inspect                              Print format info
  effectforge create                               Create a sample project JSON

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

  if (command === "pack") {
    const inputPath = args[1];
    if (!inputPath) {
      console.error("Error: missing project.json path");
      process.exit(1);
    }

    const outputPath =
      args[2] ?? inputPath.replace(/\.json$/i, "") + ".effectforge";

    const raw = await readFile(inputPath, "utf-8");
    const doc = JSON.parse(raw) as Record<string, unknown>;
    const validation = validateProject(doc);
    if (!validation.success || !validation.project) {
      console.error("Validation failed:");
      for (const d of validation.diagnostics) {
        console.error(`  [${d.severity}] ${d.code}: ${d.message}`);
      }
      process.exit(1);
    }

    const packed = packProject(validation.project);
    await writeFile(outputPath, packed.bytes);
    console.log(`Packed ${basename(outputPath)} (${packed.bytes.byteLength} bytes)`);
    process.exit(0);
  }

  if (command === "preset") {
    const subcommand = args[1];
    if (subcommand === "list") {
      for (const preset of listPresets()) {
        console.log(`${preset.id}\t${preset.name}`);
      }
      process.exit(0);
    }

    if (subcommand === "pack") {
      const inputPath = args[2];
      if (!inputPath) {
        console.error("Error: missing project.json path");
        process.exit(1);
      }

      const raw = await readFile(inputPath, "utf-8");
      const doc = JSON.parse(raw) as Record<string, unknown>;
      const validation = validateProject(doc);
      if (!validation.success || !validation.project) {
        console.error("Validation failed:");
        for (const d of validation.diagnostics) {
          console.error(`  [${d.severity}] ${d.code}: ${d.message}`);
        }
        process.exit(1);
      }

      const packed = packPresetBundle(validation.project);
      const outputPath =
        args[3] ?? join(dirname(inputPath), suggestPresetBundleFilename(packed.manifest));
      await writeFile(outputPath, packed.bytes);
      console.log(`Packed preset ${packed.manifest.id} (${packed.bytes.byteLength} bytes)`);
      process.exit(0);
    }

    if (subcommand === "unpack") {
      const bundlePath = args[2];
      if (!bundlePath) {
        console.error("Error: missing preset bundle path");
        process.exit(1);
      }

      const outputDir = args[3] ?? dirname(bundlePath);
      const bytes = new Uint8Array(await readFile(bundlePath));
      const unpacked = unpackPresetBundle(bytes);

      await mkdir(outputDir, { recursive: true });
      await writeFile(
        join(outputDir, PRESET_JSON_PATH),
        JSON.stringify(unpacked.manifest, null, 2),
        "utf-8",
      );
      await writeFile(
        join(outputDir, PROJECT_JSON_PATH),
        JSON.stringify(unpacked.project, null, 2),
        "utf-8",
      );

      for (const [assetPath, content] of Object.entries(unpacked.assets)) {
        const target = join(outputDir, assetPath);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, content);
      }

      console.log(`Unpacked preset "${unpacked.manifest.name}" to ${outputDir}`);
      process.exit(0);
    }

    console.error("Unknown preset command. Use: list, pack, unpack");
    process.exit(1);
  }

  if (command === "unpack") {
    const archivePath = args[1];
    if (!archivePath) {
      console.error("Error: missing archive path");
      process.exit(1);
    }

    const outputDir = args[2] ?? dirname(archivePath);
    const bytes = new Uint8Array(await readFile(archivePath));
    const unpacked = unpackProject(bytes);

    await mkdir(outputDir, { recursive: true });
    await writeFile(
      join(outputDir, "project.json"),
      JSON.stringify(unpacked.project, null, 2),
      "utf-8",
    );

    if (unpacked.metadata) {
      await writeFile(
        join(outputDir, "metadata.json"),
        JSON.stringify(unpacked.metadata, null, 2),
        "utf-8",
      );
    }

    for (const [assetPath, content] of Object.entries(unpacked.assets)) {
      const target = join(outputDir, assetPath);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content);
    }

    console.log(`Unpacked to ${outputDir}`);
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unexpected error");
  process.exit(1);
});
