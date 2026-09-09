import { describe, it, expect } from "vitest";
import { analyzeNarrativeCausality, generateBeatSheet } from "../ai/storyEngine";
import type { ScriptBlock } from "../types";

describe("storyEngine - Non-Linear Causality & Anti-AI-Slop Beats", () => {
  it("detects linear chronological flow accurately", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "scene_heading", text: "INT. APARTMENT - MORNING" },
      { id: "2", type: "action", text: "John makes coffee." },
      { id: "3", type: "scene_heading", text: "EXT. STREET - AFTERNOON" },
      { id: "4", type: "action", text: "John catches the bus." },
    ];

    const report = analyzeNarrativeCausality(blocks);
    expect(report.narrativeStructure).toBe("Linear");
    expect(report.causalityRating).toBe("Rock Solid");
    expect(report.timelineNodes.length).toBe(2);
    expect(report.timelineNodes[0].isFlashback).toBe(false);
  });

  it("identifies flashbacks and validates non-linear narrative without flagging plot holes", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "scene_heading", text: "INT. APARTMENT - NIGHT" },
      { id: "2", type: "action", text: "John holds a damaged pocket watch." },
      { id: "3", type: "scene_heading", text: "EXT. BATTLEFIELD - FLASHBACK - YEARS AGO" },
      { id: "4", type: "action", text: "Bullets fly. The captain hands John the watch before he falls." },
      { id: "5", type: "scene_heading", text: "INT. APARTMENT - PRESENT" },
      { id: "6", type: "action", text: "John wipes a tear." },
    ];

    const report = analyzeNarrativeCausality(blocks);
    expect(report.narrativeStructure).toBe("Non-Linear");
    expect(report.causalityRating).toBe("Rock Solid");
    expect(report.timelineNodes[1].isFlashback).toBe(true);
    expect(report.timelineNodes[1].chronologicalEstimate).toBeLessThan(report.timelineNodes[0].chronologicalEstimate);

    // Verify Anti-AI-Slop validation: twists and flashbacks are verified as deliberate narrative design
    const verifiedInsight = report.integrityInsights.find((i) => i.type === "twist_verified");
    expect(verifiedInsight).toBeDefined();
  });

  it("generates 4 major beat sheet frameworks with accurate page targets", () => {
    const stc = generateBeatSheet("save_the_cat", "A retired detective must solve his own murder.");
    expect(stc.length).toBe(15);
    expect(stc[0].title).toContain("Opening Image");
    expect(stc[8].title).toContain("Midpoint");

    const hj = generateBeatSheet("heros_journey");
    expect(hj.length).toBe(12);
    expect(hj[0].title).toContain("Ordinary World");

    const sc = generateBeatSheet("story_circle");
    expect(sc.length).toBe(8);

    const ta = generateBeatSheet("three_act");
    expect(ta.length).toBe(8);
  });
});
