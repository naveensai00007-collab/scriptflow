import { describe, it, expect } from "vitest";
import { parseFountain } from "../parse/fountain";
import { exportFountain } from "../export/fountain";
import type { ScriptRecord } from "../types";

describe("Fountain Interchange", () => {
  it("parses fountain screenplay text accurately", () => {
    const rawFountain = `Title: Coffee Run
Author: Jane Doe

INT. CAFE - MORNING

Jane waits by the counter.

BARISTA
(smiling)
Your order is ready.

JANE
Thank you.

> CUT TO:

EXT. STREET - CONTINUOUS

[[Remember to check props]]
`;

    const result = parseFountain(rawFountain);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Coffee Run");
      const types = result.value.blocks.map((b) => b.type);
      expect(types).toContain("scene_heading");
      expect(types).toContain("action");
      expect(types).toContain("character");
      expect(types).toContain("parenthetical");
      expect(types).toContain("dialogue");
      expect(types).toContain("transition");
      expect(types).toContain("note");
    }
  });

  it("exports screenplay to clean fountain format", () => {
    const script: ScriptRecord = {
      id: "test-id",
      title: "Neon City",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        { id: "1", type: "scene_heading", text: "INT. ALLEY - NIGHT" },
        { id: "2", type: "action", text: "Fog drifts over the asphalt." },
        { id: "3", type: "character", text: "KAI" },
        { id: "4", type: "dialogue", text: "Did they follow us?" },
        { id: "5", type: "note", text: "Add sound cues" },
      ],
      beatMeta: {},
      characterMeta: {},
    };

    const exported = exportFountain(script);
    expect(exported).toContain("Title: Neon City");
    expect(exported).toContain("INT. ALLEY - NIGHT");
    expect(exported).toContain("KAI\nDid they follow us?");
    expect(exported).toContain("[[Add sound cues]]");
  });
});
