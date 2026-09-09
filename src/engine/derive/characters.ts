import type { ScriptBlock, DerivedCharacter, CharacterOccurrence } from "../types";

export function normalizeCharacterName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    // Remove parenthetical extensions like (V.O.), (O.S.), (CONT'D)
    .replace(/\s*\(.*?\)/g, "")
    // Remove extra punctuation
    .replace(/[^\w\s-]/g, "")
    // Collapse multiple whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export function deriveCharacters(blocks: ScriptBlock[]): DerivedCharacter[] {
  const charactersMap = new Map<string, {
    name: string;
    dialogueCount: number;
    sceneNumbersSet: Set<number>;
    firstBlockId: string;
    lastBlockId: string;
    occurrences: CharacterOccurrence[];
    firstAppearanceIndex: number;
  }>();

  let currentSceneNumber = 0;
  let activeCharacterName: string | null = null;
  let activeCharacterRaw: string | null = null;
  let activeCharacterBlockId: string | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === "scene_heading") {
      currentSceneNumber++;
      activeCharacterName = null;
      activeCharacterRaw = null;
      activeCharacterBlockId = null;
    } else if (block.type === "character") {
      const normalized = normalizeCharacterName(block.text);
      if (normalized) {
        activeCharacterName = normalized;
        activeCharacterRaw = block.text.trim();
        activeCharacterBlockId = block.id;
      } else {
        activeCharacterName = null;
        activeCharacterRaw = null;
        activeCharacterBlockId = null;
      }
    } else if (block.type === "parenthetical") {
      // Parenthetical maintains the active character
      continue;
    } else if (block.type === "dialogue") {
      if (activeCharacterName && activeCharacterRaw && activeCharacterBlockId) {
        let charData = charactersMap.get(activeCharacterName);
        if (!charData) {
          charData = {
            name: activeCharacterName,
            dialogueCount: 0,
            sceneNumbersSet: new Set(),
            firstBlockId: activeCharacterBlockId,
            lastBlockId: activeCharacterBlockId,
            occurrences: [],
            firstAppearanceIndex: i,
          };
          charactersMap.set(activeCharacterName, charData);
        }

        charData.dialogueCount++;
        charData.sceneNumbersSet.add(currentSceneNumber);
        charData.lastBlockId = block.id;
        charData.occurrences.push({
          blockId: block.id,
          sceneNumber: currentSceneNumber,
        });
      }
    } else {
      // Action, transition, or note resets the active character
      activeCharacterName = null;
      activeCharacterRaw = null;
      activeCharacterBlockId = null;
    }
  }

  // Convert map to array sorted by dialogue count descending
  const result: DerivedCharacter[] = Array.from(charactersMap.values())
    .map((c) => ({
      id: c.name,
      name: c.name,
      dialogueCount: c.dialogueCount,
      sceneNumbers: Array.from(c.sceneNumbersSet).sort((a, b) => a - b),
      firstBlockId: c.firstBlockId,
      lastBlockId: c.lastBlockId,
      occurrences: c.occurrences,
    }))
    .sort((a, b) => b.dialogueCount - a.dialogueCount);

  return result;
}
