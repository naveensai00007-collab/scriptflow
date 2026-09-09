import { describe, it, expect } from "vitest";
import { computePagination } from "../derive/pagination";
import type { ScriptBlock } from "../types";

describe("Live Screenplay Pagination", () => {
  it("calculates page count and block pages dynamically", () => {
    const blocks: ScriptBlock[] = [
      { id: "sh1", type: "scene_heading", text: "INT. COFFEE SHOP - DAY" },
      { id: "a1", type: "action", text: "A cozy morning. Steam rises from espresso cups." },
      { id: "c1", type: "character", text: "BARISTA" },
      { id: "d1", type: "dialogue", text: "Good morning! Can I get you a latte?" },
    ];

    const result = computePagination(blocks);
    expect(result.totalPages).toBe(1);
    expect(result.blockPageMap["sh1"]).toBe(1);
    expect(result.blockPageMap["d1"]).toBe(1);
    expect(result.scenePageMap["sh1"]).toBe(1);
  });

  it("splits pages when lines exceed 54 lines", () => {
    const blocks: ScriptBlock[] = [];
    // Generate enough action blocks to exceed 54 lines
    for (let i = 0; i < 30; i++) {
      blocks.push({
        id: `block-${i}`,
        type: "action",
        text: "This is a detailed paragraph of action that describes character movement and ambient environment.",
      });
    }

    const result = computePagination(blocks);
    expect(result.totalPages).toBeGreaterThan(1);
    expect(result.pageBreakAfterBlocks.size).toBeGreaterThan(0);
  });
});