import { describe, it, expect } from "vitest";
import {
  detectBlockType,
  inferNextBlockType,
  formatTextForType,
  isSceneHeading,
  isTransition,
  isCharacterCandidate,
} from "../editor/inference";

describe("Inference Rules", () => {
  it("detects block types accurately", () => {
    expect(detectBlockType("INT. COFFEE SHOP - DAY")).toBe("scene_heading");
    expect(detectBlockType("FADE IN:")).toBe("transition");
    expect(detectBlockType("SARAH")).toBe("character");
    expect(detectBlockType("(quietly)")).toBe("parenthetical");
    expect(detectBlockType("[[Remember coffee cup]]")).toBe("note");
    expect(detectBlockType("She looks up from her book.")).toBe("action");
  });

  it("detects scene headings starting with INT or EXT", () => {
    expect(isSceneHeading("INT. COFFEE SHOP - DAY")).toBe(true);
    expect(isSceneHeading("EXT. PARK - NIGHT")).toBe(true);
    expect(isSceneHeading("INT./EXT. CAR - MOVING")).toBe(true);
    expect(isSceneHeading("I/E SUBWAY - DAY")).toBe(true);
    expect(isSceneHeading(".CUSTOM SCENE HEADING")).toBe(true);
    expect(isSceneHeading("Just action in a room")).toBe(false);
  });

  it("detects transitions", () => {
    expect(isTransition("FADE IN:")).toBe(true);
    expect(isTransition("CUT TO:")).toBe(true);
    expect(isTransition("SMASH CUT TO:")).toBe(true);
    expect(isTransition("> SLOW DISSOLVE")).toBe(true);
    expect(isTransition("NOT A TRANSITION")).toBe(false);
  });

  it("detects character candidates", () => {
    expect(isCharacterCandidate("SARAH")).toBe(true);
    expect(isCharacterCandidate("DETECTIVE MILLER (V.O.)")).toBe(true);
    expect(isCharacterCandidate("BARISTA (CONT'D)")).toBe(true);
    expect(isCharacterCandidate("Not a character line because of lowercase")).toBe(false);
    expect(isCharacterCandidate("INT. ROOM - DAY")).toBe(false); // is scene heading
  });

  it("infers next block type upon pressing Enter", () => {
    expect(inferNextBlockType("scene_heading")).toBe("action");
    expect(inferNextBlockType("action")).toBe("action");
    expect(inferNextBlockType("character")).toBe("dialogue");
    expect(inferNextBlockType("dialogue")).toBe("action");
    expect(inferNextBlockType("parenthetical")).toBe("dialogue");
    expect(inferNextBlockType("transition")).toBe("action");
  });

  it("formats text appropriately for block types", () => {
    expect(formatTextForType("int. house - day", "scene_heading")).toBe("INT. HOUSE - DAY");
    expect(formatTextForType("john", "character")).toBe("JOHN");
    expect(formatTextForType("whispering", "parenthetical")).toBe("(whispering)");
  });
});