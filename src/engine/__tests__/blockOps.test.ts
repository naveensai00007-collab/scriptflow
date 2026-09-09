import { describe, it, expect } from "vitest";
import {
  splitBlock,
  mergeWithPrevious,
  reorderScenes,
} from "../editor/blockOps";
import type { ScriptBlock } from "../types";

describe("Block Operations", () => {
  it("splits a block at caret position", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "action", text: "First sentence. Second sentence." },
    ];
    const result = splitBlock(blocks, "1", 15);
    expect(result.blocks.length).toBe(2);
    expect(result.blocks[0].text).toBe("First sentence.");
    expect(result.blocks[1].text).toBe(" Second sentence.");
    expect(result.blocks[1].id).toBe(result.focusBlockId);
  });

  it("converts empty dialogue to action on Enter instead of splitting", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "dialogue", text: "" },
    ];
    const result = splitBlock(blocks, "1", 0);
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe("action");
  });

  it("merges with previous block on backspace at start", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "action", text: "Hello " },
      { id: "2", type: "action", text: "world" },
    ];
    const result = mergeWithPrevious(blocks, "2");
    expect(result).not.toBeNull();
    expect(result!.blocks.length).toBe(1);
    expect(result!.blocks[0].text).toBe("Hello world");
    expect(result!.focusCaretPos).toBe(6);
  });

  it("reorders scenes atomically and safely", () => {
    const blocks: ScriptBlock[] = [
      { id: "sh1", type: "scene_heading", text: "INT. ONE - DAY" },
      { id: "a1", type: "action", text: "Action in one." },
      { id: "sh2", type: "scene_heading", text: "EXT. TWO - NIGHT" },
      { id: "a2", type: "action", text: "Action in two." },
    ];

    const result = reorderScenes(blocks, "sh2", "up");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.length).toBe(4);
      expect(result.value[0].id).toBe("sh2");
      expect(result.value[1].id).toBe("a2");
      expect(result.value[2].id).toBe("sh1");
      expect(result.value[3].id).toBe("a1");
    }
  });

  it("prevents reordering prologue", () => {
    const blocks: ScriptBlock[] = [
      { id: "p1", type: "action", text: "Over black." },
      { id: "sh1", type: "scene_heading", text: "INT. ONE - DAY" },
    ];
    const result = reorderScenes(blocks, "prologue", "down");
    expect(result.ok).toBe(false);
  });
});