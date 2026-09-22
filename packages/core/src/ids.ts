import { deriveStream } from "./prng.js";

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a deterministic ID from a seed stream.
 * IDs are stable when the same seed and prefix are used.
 */
export function generateId(prefix: string, seed: number, length = 12): string {
  const stream = deriveStream(seed, `id:${prefix}`);
  let id = prefix;
  for (let i = 0; i < length; i++) {
    const index = stream.nextInt(0, ID_ALPHABET.length - 1);
    id += ID_ALPHABET[index];
  }
  return id;
}

/** Generate a non-deterministic ID for interactive editor use. */
export function generateUniqueId(prefix: string): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }

  const stream = deriveStream(Date.now(), `unique-id:${prefix}`);
  return generateId(prefix, stream.nextInt(0, 2_147_483_647));
}
