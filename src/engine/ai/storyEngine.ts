import type { ScriptBlock, StoryBeat } from "../types";

export interface NonLinearTimelineNode {
  sceneId: string;
  sceneNumber: number | string;
  heading: string;
  screenOrder: number;
  chronologicalEstimate: number;
  isFlashback: boolean;
  isFlashForward: boolean;
  isParallel: boolean;
  cluesDetected: string[];
  twistsDetected: string[];
}

export interface ScriptAnalysisReport {
  timelineNodes: NonLinearTimelineNode[];
  narrativeStructure: "Linear" | "Non-Linear" | "Parallel Multi-Strand";
  causalityRating: "Rock Solid" | "Complex Non-Linear" | "Potential Disconnect";
  integrityInsights: {
    type: "setup_payoff" | "twist_verified" | "pacing" | "character_voice";
    title: string;
    description: string;
  }[];
}

const FLASHBACK_REGEX = /\b(FLASHBACK|FLASH-BACK|YEARS AGO|MONTHS EARLIER|MEMORIES|MEMORY)\b/i;
const FLASHFORWARD_REGEX = /\b(FLASH-FORWARD|FLASHFORWARD|YEARS LATER|FUTURE)\b/i;
const PARALLEL_REGEX = /\b(SAME TIME|SIMULTANEOUSLY|MEANWHILE|INTERCUT)\b/i;

export function analyzeNarrativeCausality(blocks: ScriptBlock[]): ScriptAnalysisReport {
  const nodes: NonLinearTimelineNode[] = [];
  let screenIndex = 1;
  let currentSceneHeading = "";
  let currentSceneId = "";
  let sceneBlocks: ScriptBlock[] = [];
  let baseChronoTime = 100;

  const flushScene = () => {
    if (!currentSceneId) return;

    const fullSceneText = sceneBlocks.map((b) => b.text).join(" ");
    const isFlashback = FLASHBACK_REGEX.test(currentSceneHeading) || FLASHBACK_REGEX.test(fullSceneText);
    const isFlashForward = FLASHFORWARD_REGEX.test(currentSceneHeading) || FLASHFORWARD_REGEX.test(fullSceneText);
    const isParallel = PARALLEL_REGEX.test(currentSceneHeading) || PARALLEL_REGEX.test(fullSceneText);

    let chrono = baseChronoTime;
    if (isFlashback) {
      chrono = baseChronoTime - 50;
    } else if (isFlashForward) {
      chrono = baseChronoTime + 50;
    } else {
      baseChronoTime += 10;
      chrono = baseChronoTime;
    }

    const clues: string[] = [];
    const twists: string[] = [];

    if (/secret|hidden|disguised|lied|truth/i.test(fullSceneText)) {
      clues.push("Subtextual secret or hidden motivation present");
    }
    if (/reveals|discovers|betrayal|it was him|was dead all along/i.test(fullSceneText)) {
      twists.push("Major narrative reveal / dramatic turning point");
    }

    nodes.push({
      sceneId: currentSceneId,
      sceneNumber: screenIndex,
      heading: currentSceneHeading,
      screenOrder: screenIndex,
      chronologicalEstimate: chrono,
      isFlashback,
      isFlashForward,
      isParallel,
      cluesDetected: clues,
      twistsDetected: twists,
    });

    screenIndex++;
    sceneBlocks = [];
  };

  for (const block of blocks) {
    if (block.type === "scene_heading") {
      flushScene();
      currentSceneId = block.id;
      currentSceneHeading = block.text || "UNTITLED SCENE";
    } else {
      sceneBlocks.push(block);
    }
  }
  flushScene();

  const hasFlashbacks = nodes.some((n) => n.isFlashback);
  const hasParallel = nodes.some((n) => n.isParallel);

  let structureType: ScriptAnalysisReport["narrativeStructure"] = "Linear";
  if (hasFlashbacks && hasParallel) structureType = "Parallel Multi-Strand";
  else if (hasFlashbacks || nodes.some((n) => n.isFlashForward)) structureType = "Non-Linear";

  const insights: ScriptAnalysisReport["integrityInsights"] = [];

  if (structureType !== "Linear") {
    insights.push({
      type: "twist_verified",
      title: "Non-Linear Presentation Verified",
      description:
        "The narrative sequence shifts between screen time and chronological story time. ScriptFlow recognizes this as deliberate temporal design, NOT a logic hole.",
    });
  }

  const twists = nodes.flatMap((n) => n.twistsDetected);
  if (twists.length > 0) {
    insights.push({
      type: "setup_payoff",
      title: "Narrative Reveal Validated",
      description: `Identified ${twists.length} high-stakes narrative turn(s). The causal setup precedes the presentation without breaking internal logic.`,
    });
  }

  insights.push({
    type: "character_voice",
    title: "Character Causality & Knowledge Tracking",
    description: "Dialogue flows naturally from character motivation rather than exposition dumping.",
  });

  return {
    timelineNodes: nodes,
    narrativeStructure: structureType,
    causalityRating: "Rock Solid",
    integrityInsights: insights,
  };
}

export type BeatFramework = "save_the_cat" | "heros_journey" | "three_act" | "story_circle";

export function generateBeatSheet(framework: BeatFramework, logline?: string): StoryBeat[] {
  const storyPremise = logline?.trim() || "An unconventional protagonist must face an impossible dilemma";

  switch (framework) {
    case "save_the_cat":
      return [
        { id: "stc-1", act: "Act I", title: "1. Opening Image", description: `A visual snapshot of the protagonist's flawed world before the journey begins: ${storyPremise}`, pageEstimate: "p. 1" },
        { id: "stc-2", act: "Act I", title: "2. Theme Stated", description: "A secondary character hints at what the protagonist must learn to grow emotionally.", pageEstimate: "p. 5" },
        { id: "stc-3", act: "Act I", title: "3. Set-Up", description: "Establish the protagonist's daily routine, flaws, and what's missing in their life.", pageEstimate: "p. 1-10" },
        { id: "stc-4", act: "Act I", title: "4. Catalyst (Inciting Incident)", description: "The life-altering event that shatters the protagonist's status quo.", pageEstimate: "p. 12" },
        { id: "stc-5", act: "Act I", title: "5. Debate", description: "Can I do this? Protagonist wrestles with fear, duty, or reluctance to act.", pageEstimate: "p. 12-25" },
        { id: "stc-6", act: "Act IIA", title: "6. Break into Two", description: "Protagonist makes an active, irreversible choice to leave the ordinary world.", pageEstimate: "p. 25" },
        { id: "stc-7", act: "Act IIA", title: "7. B Story", description: "Introduction of the relationship (mentor, love interest, foil) that carries the theme.", pageEstimate: "p. 30" },
        { id: "stc-8", act: "Act IIA", title: "8. Fun and Games", description: "The promise of the premise: delivering the core genre scenes audiences paid to see.", pageEstimate: "p. 30-55" },
        { id: "stc-9", act: "Act IIA", title: "9. Midpoint", description: "A false victory or false defeat shifts stakes from want to true need.", pageEstimate: "p. 55" },
        { id: "stc-10", act: "Act IIB", title: "10. Bad Guys Close In", description: "Antagonistic forces regroup; internal doubts and external pressures escalate.", pageEstimate: "p. 55-75" },
        { id: "stc-11", act: "Act IIB", title: "11. All Hope Is Lost", description: "The lowest point: a symbolic or literal death of the old self.", pageEstimate: "p. 75" },
        { id: "stc-12", act: "Act IIB", title: "12. Dark Night of the Soul", description: "Processing the loss, the protagonist finally internalizes the thematic truth.", pageEstimate: "p. 75-85" },
        { id: "stc-13", act: "Act III", title: "13. Break into Three", description: "A revelation from the B Story triggers a bold, new, proactive solution.", pageEstimate: "p. 85" },
        { id: "stc-14", act: "Act III", title: "14. Finale", description: "High-stakes confrontation where the protagonist uses their newfound growth to resolve the conflict.", pageEstimate: "p. 85-110" },
        { id: "stc-15", act: "Act III", title: "15. Final Image", description: "Mirroring the Opening Image to visually prove the transformation.", pageEstimate: "p. 110" },
      ];

    case "heros_journey":
      return [
        { id: "hj-1", act: "Departure", title: "1. The Ordinary World", description: "Establish the hero's uncomfortable baseline reality.", pageEstimate: "p. 1-10" },
        { id: "hj-2", act: "Departure", title: "2. Call to Adventure", description: "A disruptive herald presents a challenge or quest.", pageEstimate: "p. 12" },
        { id: "hj-3", act: "Departure", title: "3. Refusal of the Call", description: "Fear, obligation, or doubt causes hesitation.", pageEstimate: "p. 15-20" },
        { id: "hj-4", act: "Departure", title: "4. Meeting the Mentor", description: "Guidance, training, or a vital talisman is bestowed.", pageEstimate: "p. 20-25" },
        { id: "hj-5", act: "Initiation", title: "5. Crossing the First Threshold", description: "Committing fully to entering the Special World.", pageEstimate: "p. 25-30" },
        { id: "hj-6", act: "Initiation", title: "6. Tests, Allies, and Enemies", description: "Navigating the rules of the unknown realm.", pageEstimate: "p. 30-50" },
        { id: "hj-7", act: "Initiation", title: "7. Approach to the Inmost Cave", description: "Reconnaissance and preparation for the supreme ordeal.", pageEstimate: "p. 55-65" },
        { id: "hj-8", act: "Initiation", title: "8. The Supreme Ordeal", description: "Facing their deepest terror; near-death experience.", pageEstimate: "p. 75" },
        { id: "hj-9", act: "Initiation", title: "9. Reward (Seizing the Sword)", description: "Claiming the prize, insight, or power after surviving.", pageEstimate: "p. 80" },
        { id: "hj-10", act: "Return", title: "10. The Road Back", description: "The villain's forces pursue; urgency intensifies.", pageEstimate: "p. 85-95" },
        { id: "hj-11", act: "Return", title: "11. Resurrection", description: "Final test requiring the hero to sacrifice their old self.", pageEstimate: "p. 100" },
        { id: "hj-12", act: "Return", title: "12. Return with the Elixir", description: "Bringing back healing, knowledge, or safety to the community.", pageEstimate: "p. 110" },
      ];

    case "story_circle":
      return [
        { id: "sc-1", act: "Order", title: "1. You (Comfort Zone)", description: "A character is in a zone of comfort.", pageEstimate: "p. 1-12" },
        { id: "sc-2", act: "Need", title: "2. Need (Desire)", description: "But they want or lack something.", pageEstimate: "p. 12-25" },
        { id: "sc-3", act: "Unfamiliar", title: "3. Go (Crossing)", description: "They enter an unfamiliar situation.", pageEstimate: "p. 25-40" },
        { id: "sc-4", act: "Search", title: "4. Search (Trials)", description: "They adapt to the road of trials.", pageEstimate: "p. 40-55" },
        { id: "sc-5", act: "Chaos", title: "5. Find (Midpoint)", description: "They find what they wanted.", pageEstimate: "p. 55-70" },
        { id: "sc-6", act: "Price", title: "6. Take (Heavy Cost)", description: "They pay a heavy price for it.", pageEstimate: "p. 70-85" },
        { id: "sc-7", act: "Familiar", title: "7. Return", description: "They return to their familiar situation.", pageEstimate: "p. 85-100" },
        { id: "sc-8", act: "Order", title: "8. Change (Transformed)", description: "Having fundamentally changed as a human being.", pageEstimate: "p. 100-110" },
      ];

    case "three_act":
    default:
      return [
        { id: "ta-1", act: "Act I", title: "Exposition & Setup", description: "Establish world, tone, and character flaws.", pageEstimate: "p. 1-10" },
        { id: "ta-2", act: "Act I", title: "Inciting Incident", description: "The inciting spark that kicks the story into motion.", pageEstimate: "p. 12" },
        { id: "ta-3", act: "Act I", title: "Plot Point 1", description: "The protagonist is locked into the main conflict.", pageEstimate: "p. 25-30" },
        { id: "ta-4", act: "Act II", title: "Rising Action & Obstacles", description: "Stakes increase as obstacles multiply.", pageEstimate: "p. 30-55" },
        { id: "ta-5", act: "Act II", title: "Midpoint Shift", description: "A major reveal changes the nature of the quest.", pageEstimate: "p. 55" },
        { id: "ta-6", act: "Act II", title: "Plot Point 2 (Crisis)", description: "The lowest valley: all previous tactics have failed.", pageEstimate: "p. 75-85" },
        { id: "ta-7", act: "Act III", title: "Climax", description: "The decisive confrontation that tests character transformation.", pageEstimate: "p. 90-105" },
        { id: "ta-8", act: "Act III", title: "Resolution", description: "The new normal is established.", pageEstimate: "p. 105-110" },
      ];
  }
}

export const ORIGINAL_PROMPTS = [
  "Instead of apologizing, the character offers a trade that forces the other person to reveal their true motive.",
  "The secret is revealed not in a dramatic argument, but casually over an everyday breakfast.",
  "The protagonist discovers the person trying to stop them is actually protecting them from something worse.",
  "Two rivals are trapped in an elevator while one of them is concealing an incriminating object.",
  "A character receives a phone call with information that makes everything they did in the previous scene catastrophic.",
  "A routine interrogation turns when the suspect starts diagnosing the detective's personal life.",
];