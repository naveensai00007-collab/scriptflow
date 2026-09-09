import { describe, it, expect } from "vitest";
import {
  renameCharacterAcrossScript,
  mergeCharactersAcrossScript,
  cycleBlockType,
  toggleDualDialogue,
} from "../editor/blockOps";
import type { ScriptBlock } from "../types";

describe("Character Bench & Advanced Block Operations", () => {
  it("renames character occurrences across the script", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "character", text: "BOB" },
      { id: "2", type: "dialogue", text: "Hey!" },
      { id: "3", type: "character", text: "ALICE" },
      { id: "4", type: "character", text: "BOB" },
    ];

    const updated = renameCharacterAcrossScript(blocks, "BOB", "ROBERT");
    expect(updated[0].text).toBe("ROBERT");
    expect(updated[2].text).toBe("ALICE");
    expect(updated[3].text).toBe("ROBERT");
  });

  it("merges two characters", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "character", text: "COP 1" },
      { id: "2", type: "character", text: "OFFICER MILLER" },
    ];

    const merged = mergeCharactersAcrossScript(blocks, "OFFICER MILLER", "COP 1");
    expect(merged[0].text).toBe("COP 1");
    expect(merged[1].text).toBe("COP 1");
  });

  it("cycles block type on Tab", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "action", text: "Walking." },
    ];
    const cycled = cycleBlockType(blocks, "1", "forward");
    expect(cycled[0].type).toBe("character");

    const cycledBack = cycleBlockType(cycled, "1", "backward");
    expect(cycledBack[0].type).toBe("action");
  });

  it("toggles dual dialogue", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "character", text: "BOB", isDualDialogue: false },
    ];
    const toggled = toggleDualDialogue(blocks, "1");
    expect(toggled[0].isDualDialogue).toBe(true);
  });
});