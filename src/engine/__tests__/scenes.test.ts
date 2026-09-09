import { describe, it, expect } from "vitest";
import { deriveScenes } from "../derive/scenes";
import type { ScriptBlock } from "../types";

describe("Scene Derivation", () => {
  it("derives scenes from scene heading blocks", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "scene_heading", text: "INT. CAFE - DAY" },
      { id: "2", type: "action", text: "Customers sip coffee." },
      { id: "3", type: "scene_heading", text: "EXT. STREET - CONTINUOUS" },
      { id: "4", type: "action", text: "Rain starts pouring." },
    ];

    const scenes = deriveScenes(blocks);
    expect(scenes.length).toBe(2);
    expect(scenes[0].number).toBe(1);
    expect(scenes[0].heading).toBe("INT. CAFE - DAY");
    expect(scenes[0].synopsis).toBe("Customers sip coffee.");
    expect(scenes[1].number).toBe(2);
    expect(scenes[1].heading).toBe("EXT. STREET - CONTINUOUS");
    expect(scenes[1].synopsis).toBe("Rain starts pouring.");
  });

  it("handles prologue blocks before first scene heading", () => {
    const blocks: ScriptBlock[] = [
      { id: "p1", type: "action", text: "White text on black." },
      { id: "1", type: "scene_heading", text: "INT. BEDROOM - NIGHT" },
    ];

    const scenes = deriveScenes(blocks);
    expect(scenes.length).toBe(2);
    expect(scenes[0].isPrologue).toBe(true);
    expect(scenes[0].number).toBe(0);
    expect(scenes[1].number).toBe(1);
  });
});
