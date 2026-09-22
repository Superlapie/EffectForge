import { execSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProjectFromPreset } from "@effectforge/presets";
import { exportProject } from "@effectforge/exporter-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const validationRoot = join(__dirname, "..");
const targets = ["vanilla", "react-vite"];

async function writeExport(target, project) {
  const outDir = join(validationRoot, ".tmp", target);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const result = exportProject(project, target, {
    runtimeVersion: "workspace:*",
  });

  for (const file of result.files) {
    const filePath = join(outDir, file.path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, file.content, "utf8");
  }

  return outDir;
}

async function main() {
  const project = createProjectFromPreset("cursor-attract-sparkles");
  const monorepoRoot = join(validationRoot, "../..");

  console.log("Installing export-validation workspace dependencies...");
  execSync("pnpm install", { cwd: validationRoot, stdio: "inherit" });

  for (const target of targets) {
    console.log(`\nGenerating ${target} export...`);
    await writeExport(target, project);
  }

  console.log("\nLinking generated exports in workspace...");
  execSync("pnpm install", { cwd: validationRoot, stdio: "inherit" });

  console.log("Building @effectforge/runtime...");
  execSync("pnpm --filter @effectforge/runtime build", { cwd: monorepoRoot, stdio: "inherit" });

  for (const target of targets) {
    const outDir = join(validationRoot, ".tmp", target);
    console.log(`\nBuilding ${target} export at ${outDir}...`);
    execSync("pnpm build", { cwd: outDir, stdio: "inherit" });

    const pkg = JSON.parse(await readFile(join(outDir, "package.json"), "utf8"));
    if (!pkg.dependencies?.["@effectforge/runtime"]) {
      throw new Error(`Missing runtime dependency in ${target} export`);
    }
  }

  console.log("\nExport validation passed for:", targets.join(", "));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
