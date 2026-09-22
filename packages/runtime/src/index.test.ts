import { describe, expect, it } from "vitest";
import { mountEffect } from "./index.js";

describe("@effectforge/runtime", () => {
  it("exports mountEffect", () => {
    expect(typeof mountEffect).toBe("function");
  });
});
