import { describe, expect, it } from "vitest";

import { selectVariantTaskIds } from "@/server/services/variant.service";

describe("selectVariantTaskIds", () => {
  it("takes a deterministic slice for MVP generation", () => {
    const selected = selectVariantTaskIds(["a", "b", "c", "d"], 3);
    expect(selected).toEqual(["a", "b", "c"]);
  });
});
