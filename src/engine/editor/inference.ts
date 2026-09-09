import type { BlockType } from "../types";

const SCENE_HEADING_REGEX = /^(INT|EXT|EST|INT\.\/EXT|INT\/EXT|I\/E)[\.\s]/i;
const TRANSITION_REGEX = /^(FADE IN:|FADE OUT\.|FADE TO BLACK\.|CUT TO:|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:|JUMP CUT TO:|.+ TO:)$/i;
const PARENTHETICAL_REGEX = /^\(.*\)$/;
const NOTE_REGEX = /^\[\[.*\]\]$/;

export function isSceneHeading(text: string): boolean {
  const trimmed = text.trim();
  return SCENE_HEADING_REGEX.test(trimmed) || trimmed.startsWith(".");
}

export function isTransition(text: string): boolean {
  const trimmed = text.trim();
  return TRANSITION_REGEX.test(trimmed) || trimmed.startsWith(">");
}

export function isParenthetical(text: string): boolean {
  const trimmed = text.trim();
  return PARENTHETICAL_REGEX.test(trimmed);
}

export function isNote(text: string): boolean {
  const trimmed = text.trim();
  return NOTE_REGEX.test(trimmed);
}

export function isCharacterCandidate(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 40) return false;
  if (isSceneHeading(trimmed) || isTransition(trimmed)) return false;
  if (!/[A-Za-z]/.test(trimmed)) return false;

  // Stripping extension like (V.O.) or (CONT'D) to check name casing
  const withoutExt = trimmed.replace(/\s*\(.*\)$/, "").trim();
  if (!withoutExt) return false;

  // Must be uppercase
  return withoutExt === withoutExt.toUpperCase();
}

export function detectBlockType(text: string, currentType?: BlockType): BlockType {
  const trimmed = text.trim();
  if (!trimmed) {
    return currentType || "action";
  }

  if (isSceneHeading(trimmed)) {
    return "scene_heading";
  }
  if (isTransition(trimmed)) {
    return "transition";
  }
  if (isNote(trimmed)) {
    return "note";
  }
  if (isParenthetical(trimmed)) {
    return "parenthetical";
  }
  if (isCharacterCandidate(trimmed)) {
    return "character";
  }

  return currentType || "action";
}

export function inferNextBlockType(currentType: BlockType): BlockType {
  switch (currentType) {
    case "scene_heading":
      return "action";
    case "action":
      return "action";
    case "character":
      return "dialogue";
    case "dialogue":
      return "action";
    case "parenthetical":
      return "dialogue";
    case "transition":
      return "action";
    case "note":
      return "action";
    default:
      return "action";
  }
}

export function formatTextForType(text: string, type: BlockType): string {
  switch (type) {
    case "scene_heading":
    case "character":
    case "transition":
      return text.toUpperCase();
    case "parenthetical": {
      let t = text.trim();
      if (!t.startsWith("(")) t = `(${t}`;
      if (!t.endsWith(")")) t = `${t})`;
      return t;
    }
    default:
      return text;
  }
}
