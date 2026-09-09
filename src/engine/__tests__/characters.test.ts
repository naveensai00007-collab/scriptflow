import { describe, it, expect } from "vitest";
import { deriveCharacters, normalizeCharacterName } from "../derive/characters";
import type { ScriptBlock } from "../types";

describe("Character Derivation", () => {
  it("normalizes character names correctly", () => {
    expect(normalizeCharacterName("SARAH (V.O.)")).toBe("SARAH");
    expect(normalizeCharacterName("DETECTIVE MILLER (CONT'D)")).toBe("DETECTIVE MILLER");
    expect(normalizeCharacterName("  BOB   ")).toBe("BOB");
  });

  it("extracts characters and calculates dialogue occurrences", () => {
    const blocks: ScriptBlock[] = [
      { id: "sh1", type: "scene_heading", text: "INT. DINER - DAY" },
      { id: "c1", type: "character", text: "ALICE" },
      { id: "d1", type: "dialogue", text: "Where is the briefcase?" },
      { id: "c2", type: "character", text: "BOB (O.S.)" },
      { id: "p1", type: "parenthetical", text: "(grins)" },
      { id: "d2", type: "dialogue", text: "Right here." },
      { id: "c3", type: "character", text: "ALICE" },
      { id: "d3", type: "dialogue", text: "Open it." },
    ];

    const characters = deriveCharacters(blocks);
    expect(characters.length).toBe(2);
    // ALICE has 2 dialogues, BOB has 1
    expect(characters[0].name).toBe("ALICE");
    expect(characters[0].dialogueCount).toBe(2);
    expect(characters[0].sceneNumbers).toEqual([1]);

    expect(characters[1].name).toBe("BOB");
    expect(characters[1].dialogueCount).toBe(1);
  });
});
