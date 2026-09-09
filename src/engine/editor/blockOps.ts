import type { ScriptBlock, BlockType, Result } from "../types";
import { generateBlockId } from "../ids";
import { inferNextBlockType, formatTextForType, detectBlockType } from "./inference";

const CYCLE_ORDER: BlockType[] = [
  "action",
  "character",
  "parenthetical",
  "dialogue",
  "transition",
  "scene_heading",
];

export function cycleBlockType(
  blocks: ScriptBlock[],
  blockId: string,
  direction: "forward" | "backward" = "forward"
): ScriptBlock[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b;
    const currentIndex = CYCLE_ORDER.indexOf(b.type);
    let nextIndex: number;
    if (currentIndex === -1) {
      nextIndex = 0;
    } else if (direction === "forward") {
      nextIndex = (currentIndex + 1) % CYCLE_ORDER.length;
    } else {
      nextIndex = (currentIndex - 1 + CYCLE_ORDER.length) % CYCLE_ORDER.length;
    }
    const newType = CYCLE_ORDER[nextIndex];
    return {
      ...b,
      type: newType,
      text: formatTextForType(b.text, newType),
    };
  });
}

export function toggleDualDialogue(
  blocks: ScriptBlock[],
  blockId: string
): ScriptBlock[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b;
    return {
      ...b,
      isDualDialogue: !b.isDualDialogue,
    };
  });
}

export function renameCharacterAcrossScript(
  blocks: ScriptBlock[],
  oldName: string,
  newName: string
): ScriptBlock[] {
  const normOld = oldName.trim().toUpperCase();
  const normNew = newName.trim().toUpperCase();
  if (!normOld || !normNew || normOld === normNew) return blocks;

  return blocks.map((b) => {
    if (b.type === "character" && b.text.trim().toUpperCase() === normOld) {
      return {
        ...b,
        text: normNew,
      };
    }
    return b;
  });
}

export function mergeCharactersAcrossScript(
  blocks: ScriptBlock[],
  sourceName: string,
  targetName: string
): ScriptBlock[] {
  return renameCharacterAcrossScript(blocks, sourceName, targetName);
}

export function createInitialBlock(): ScriptBlock {
  return {
    id: generateBlockId(),
    type: "action",
    text: "",
  };
}

export function updateBlockText(
  blocks: ScriptBlock[],
  blockId: string,
  newText: string,
  isRevisionMode = false,
  revisionDraft = "White"
): ScriptBlock[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b;
    let nextType = b.type;
    if (b.type === "action" || b.type === "scene_heading") {
      const detected = detectBlockType(newText, b.type);
      if (detected === "scene_heading") {
        nextType = "scene_heading";
      }
    }
    return {
      ...b,
      type: nextType,
      text: newText,
      isRevised: isRevisionMode ? true : b.isRevised,
      revisionDraft: isRevisionMode ? revisionDraft : b.revisionDraft,
    };
  });
}

export function changeBlockType(
  blocks: ScriptBlock[],
  blockId: string,
  newType: BlockType
): ScriptBlock[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b;
    return {
      ...b,
      type: newType,
      text: formatTextForType(b.text, newType),
    };
  });
}

export interface SplitResult {
  blocks: ScriptBlock[];
  focusBlockId: string;
  focusCaretPos: number;
}

export function splitBlock(
  blocks: ScriptBlock[],
  blockId: string,
  caretPos: number
): SplitResult {
  const index = blocks.findIndex((b) => b.id === blockId);
  if (index === -1) {
    return { blocks, focusBlockId: blockId, focusCaretPos: caretPos };
  }

  const current = blocks[index];
  const text = current.text;

  // Empty dialogue exit rule: convert to action
  if (current.type === "dialogue" && text.trim() === "") {
    const updated = [...blocks];
    updated[index] = { ...current, type: "action" };
    return { blocks: updated, focusBlockId: current.id, focusCaretPos: 0 };
  }

  // Empty scene heading rule: convert to action
  if (current.type === "scene_heading" && text.trim() === "") {
    const updated = [...blocks];
    updated[index] = { ...current, type: "action" };
    return { blocks: updated, focusBlockId: current.id, focusCaretPos: 0 };
  }

  // Caret at start (0): insert empty block before
  if (caretPos === 0) {
    const newBlock: ScriptBlock = {
      id: generateBlockId(),
      type: "action",
      text: "",
    };
    const updated = [...blocks.slice(0, index), newBlock, ...blocks.slice(index)];
    return { blocks: updated, focusBlockId: current.id, focusCaretPos: 0 };
  }

  const textBefore = text.slice(0, caretPos);
  const textAfter = text.slice(caretPos);

  const updatedCurrent: ScriptBlock = {
    ...current,
    type: current.type === "action" && detectBlockType(textBefore) === "scene_heading" ? "scene_heading" : current.type,
    text: formatTextForType(textBefore, current.type),
  };

  const nextType = inferNextBlockType(updatedCurrent.type);
  const newBlock: ScriptBlock = {
    id: generateBlockId(),
    type: nextType,
    text: textAfter,
  };

  const updated = [
    ...blocks.slice(0, index),
    updatedCurrent,
    newBlock,
    ...blocks.slice(index + 1),
  ];

  return {
    blocks: updated,
    focusBlockId: newBlock.id,
    focusCaretPos: 0,
  };
}

export interface MergeResult {
  blocks: ScriptBlock[];
  focusBlockId: string;
  focusCaretPos: number;
}

export function mergeWithPrevious(
  blocks: ScriptBlock[],
  blockId: string
): MergeResult | null {
  const index = blocks.findIndex((b) => b.id === blockId);
  if (index <= 0) return null;

  const current = blocks[index];
  const previous = blocks[index - 1];

  if (current.text.length === 0) {
    const updated = [...blocks.slice(0, index), ...blocks.slice(index + 1)];
    return {
      blocks: updated,
      focusBlockId: previous.id,
      focusCaretPos: previous.text.length,
    };
  }

  const prevLen = previous.text.length;
  const mergedPrevious: ScriptBlock = {
    ...previous,
    text: previous.text + current.text,
  };

  const updated = [
    ...blocks.slice(0, index - 1),
    mergedPrevious,
    ...blocks.slice(index + 1),
  ];

  return {
    blocks: updated,
    focusBlockId: previous.id,
    focusCaretPos: prevLen,
  };
}

export function deleteBlock(
  blocks: ScriptBlock[],
  blockId: string
): { blocks: ScriptBlock[]; focusBlockId: string | null } {
  if (blocks.length <= 1) {
    const initial = createInitialBlock();
    return { blocks: [initial], focusBlockId: initial.id };
  }

  const index = blocks.findIndex((b) => b.id === blockId);
  if (index === -1) return { blocks, focusBlockId: null };

  const prevBlock = index > 0 ? blocks[index - 1] : blocks[index + 1];
  const updated = blocks.filter((b) => b.id !== blockId);

  return {
    blocks: updated,
    focusBlockId: prevBlock ? prevBlock.id : null,
  };
}

interface SceneSection {
  sceneId: string;
  isPrologue: boolean;
  startIndex: number;
  endIndex: number;
}

function getSceneSections(blocks: ScriptBlock[]): SceneSection[] {
  const sections: SceneSection[] = [];
  let currentStart = 0;
  let currentId: string | null = null;

  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === "scene_heading") {
      if (i > 0 && currentId === null) {
        sections.push({
          sceneId: "prologue",
          isPrologue: true,
          startIndex: 0,
          endIndex: i,
        });
      } else if (currentId !== null) {
        sections.push({
          sceneId: currentId,
          isPrologue: false,
          startIndex: currentStart,
          endIndex: i,
        });
      }
      currentId = blocks[i].id;
      currentStart = i;
    }
  }

  if (currentId !== null) {
    sections.push({
      sceneId: currentId,
      isPrologue: false,
      startIndex: currentStart,
      endIndex: blocks.length,
    });
  } else if (blocks.length > 0) {
    sections.push({
      sceneId: "prologue",
      isPrologue: true,
      startIndex: 0,
      endIndex: blocks.length,
    });
  }

  return sections;
}

export function reorderScenes(
  blocks: ScriptBlock[],
  sceneIdToMove: string,
  direction: "up" | "down"
): Result<ScriptBlock[]> {
  if (sceneIdToMove === "prologue") {
    return { ok: false, error: "Prologue cannot be reordered." };
  }

  const sections = getSceneSections(blocks);
  const movableSections = sections.filter((s) => !s.isPrologue);
  const targetIndex = movableSections.findIndex((s) => s.sceneId === sceneIdToMove);

  if (targetIndex === -1) {
    return { ok: false, error: "Scene not found." };
  }

  const swapWithIndex = direction === "up" ? targetIndex - 1 : targetIndex + 1;
  if (swapWithIndex < 0 || swapWithIndex >= movableSections.length) {
    return { ok: false, error: "Cannot move scene beyond boundaries." };
  }

  const prologueSection = sections.find((s) => s.isPrologue);
  const prologueBlocks = prologueSection
    ? blocks.slice(prologueSection.startIndex, prologueSection.endIndex)
    : [];

  const newSections = [...movableSections];
  const temp = newSections[targetIndex];
  newSections[targetIndex] = newSections[swapWithIndex];
  newSections[swapWithIndex] = temp;

  const newBlocks: ScriptBlock[] = [...prologueBlocks];
  for (const section of newSections) {
    newBlocks.push(...blocks.slice(section.startIndex, section.endIndex));
  }

  const originalIds = new Set(blocks.map((b) => b.id));
  const newIds = new Set(newBlocks.map((b) => b.id));

  if (
    blocks.length !== newBlocks.length ||
    originalIds.size !== newIds.size ||
    [...originalIds].some((id) => !newIds.has(id))
  ) {
    return { ok: false, error: "Reorder validation failed: block integrity violated." };
  }

  return { ok: true, value: newBlocks };
}