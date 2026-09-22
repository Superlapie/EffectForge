"use client";

import type { EditorController } from "@effectforge/editor";
import {
  downloadPresetBundle,
  importPresetBundle,
  unpackPresetBundleFromFile,
} from "@effectforge/presets";

export function exportPresetBundle(controller: EditorController): void {
  const { project } = controller.getState();
  downloadPresetBundle(project, {
    description: project.metadata.description,
    tags: project.metadata.tags,
    author: project.metadata.author,
  });
}

export async function importPresetBundleFile(
  controller: EditorController,
  file: File,
): Promise<string | null> {
  try {
    const result = await unpackPresetBundleFromFile(file);
    const bytes = new Uint8Array(await file.arrayBuffer());
    importPresetBundle(bytes);
    controller.loadProject(result.project);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to import preset bundle.";
  }
}
