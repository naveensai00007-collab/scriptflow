import type { ScriptBlock, DerivedScene, BeatMeta } from "../types";

export function deriveScenes(
  blocks: ScriptBlock[],
  beatMeta: Record<string, BeatMeta> = {},
  scenePageMap: Record<string, number> = {}
): DerivedScene[] {
  const scenes: DerivedScene[] = [];
  let currentScene: DerivedScene | null = null;
  let firstActionText = "";
  let sceneCounter = 1;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === "scene_heading") {
      if (currentScene) {
        if (!currentScene.synopsis) {
          currentScene.synopsis = firstActionText
            ? firstActionText.slice(0, 160)
            : "No action yet.";
        }
        currentScene.endBlockIdExclusive = block.id;
        scenes.push(currentScene);
      } else if (i > 0) {
        const prologueSynopsis = firstActionText
          ? firstActionText.slice(0, 160)
          : "No action yet.";
        scenes.push({
          id: "prologue",
          number: 0,
          heading: "PROLOGUE",
          synopsis: prologueSynopsis,
          startBlockId: blocks[0].id,
          endBlockIdExclusive: block.id,
          isPrologue: true,
          pageNumber: scenePageMap["prologue"] || 1,
        });
      }

      firstActionText = "";
      const meta = beatMeta[block.id];
      const customNote = meta?.note?.trim();

      currentScene = {
        id: block.id,
        number: sceneCounter++,
        heading: block.text || "UNTITLED SCENE",
        synopsis: customNote || "",
        startBlockId: block.id,
        endBlockIdExclusive: null,
        isPrologue: false,
        pageNumber: scenePageMap[block.id] || 1,
      };
    } else if (block.type === "action" && !firstActionText && block.text.trim()) {
      firstActionText = block.text.trim();
    }
  }

  if (currentScene) {
    if (!currentScene.synopsis) {
      currentScene.synopsis = firstActionText
        ? firstActionText.slice(0, 160)
        : "No action yet.";
    }
    scenes.push(currentScene);
  } else if (blocks.length > 0 && scenes.length === 0) {
    const hasText = blocks.some((b) => b.text.trim() !== "");
    if (hasText) {
      scenes.push({
        id: "prologue",
        number: 0,
        heading: "PROLOGUE",
        synopsis: firstActionText
          ? firstActionText.slice(0, 160)
          : "No action yet.",
        startBlockId: blocks[0].id,
        endBlockIdExclusive: null,
        isPrologue: true,
        pageNumber: 1,
      });
    }
  }

  return scenes;
}