#!/usr/bin/env node
/**
 * Dependency license audit.
 * Fails CI when an unapproved license is introduced.
 */

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");

const ALLOWED = new Set([
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "Zlib",
  "CC0-1.0",
  "CC-BY-4.0",
  "0BSD",
  "Unlicense",
  "BlueOak-1.0.0",
]);

const REVIEW_REQUIRED_PREFIXES = ["MPL-2.0", "LGPL"];

const FORBIDDEN = new Set([
  "GPL-1.0-only",
  "GPL-2.0-only",
  "GPL-3.0-only",
  "AGPL-1.0-only",
  "AGPL-3.0-only",
  "SSPL-1.0",
  "BUSL-1.1",
]);

function normalizeLicense(license) {
  if (!license || license === "UNLICENSED") return "UNLICENSED";
  if (typeof license === "object") {
    if (license.type) return normalizeLicense(license.type);
    return "UNKNOWN";
  }
  const str = String(license);
  if (str.includes(" AND ")) return str.split(" AND ")[0].trim();
  if (str.includes(" OR ")) {
    const parts = str.split(" OR ").map((p) => p.replace(/[()]/g, "").trim());
    for (const part of parts) {
      if (ALLOWED.has(part)) return part;
    }
    return parts[0];
  }
  return str.replace(/[()]/g, "").trim();
}

function getLicenseFromPackage(pkgPath) {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return normalizeLicense(pkg.license);
  } catch {
    return "UNKNOWN";
  }
}

function audit() {
  let output;
  try {
    output = execSync("pnpm list -r --json --depth Infinity", {
      cwd: root,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to run pnpm list: ${message}`);
    process.exit(1);
  }

  const data = JSON.parse(output);
  const violations = [];
  const review = [];
  const seen = new Set();

  function walk(node) {
    if (!node || seen.has(node.path)) return;
    seen.add(node.path);

    const pkgJsonPath = resolve(node.path, "package.json");
    if (!existsSync(pkgJsonPath)) return;

    const license = getLicenseFromPackage(pkgJsonPath);
    const name = node.name ?? node.path;

    const needsReview = REVIEW_REQUIRED_PREFIXES.some((prefix) =>
      license.startsWith(prefix),
    );

    if (FORBIDDEN.has(license)) {
      violations.push({ name, license, path: node.path });
    } else if (needsReview) {
      review.push({ name, license, path: node.path });
    } else if (!ALLOWED.has(license) && license !== "UNLICENSED") {
      violations.push({ name, license, path: node.path, reason: "unapproved" });
    }

    if (node.dependencies) {
      for (const dep of Object.values(node.dependencies)) {
        walk(dep);
      }
    }
  }

  for (const project of data) {
    walk(project);
  }

  console.log(`License audit complete. Scanned ${seen.size} packages.`);

  if (review.length > 0) {
    console.warn("\nPackages requiring manual license review:");
    for (const r of review) {
      console.warn(`  ${r.name}: ${r.license}`);
    }
  }

  if (violations.length > 0) {
    console.error("\nLicense violations found:");
    for (const v of violations) {
      console.error(`  ${v.name}: ${v.license} (${v.reason ?? "forbidden"})`);
    }
    process.exit(1);
  }

  console.log("All dependency licenses are approved.");
}

audit();
