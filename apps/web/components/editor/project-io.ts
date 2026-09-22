"use client";

import type { EditorController } from "@effectforge/editor";
import {
  downloadProjectArchive,
  suggestArchiveFilename,
  unpackProjectFromFile,
} from "@effectforge/project-format";

export function saveProjectArchive(controller: EditorController): void {
  const { project } = controller.getState();
  downloadProjectArchive(project, suggestArchiveFilename(project));
}

export async function openProjectArchive(
  controller: EditorController,
  file: File,
): Promise<string | null> {
  try {
    const result = await unpackProjectFromFile(file);
    controller.loadProject(result.project);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to open archive.";
  }
}
