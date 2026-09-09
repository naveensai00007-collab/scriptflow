import type { ScriptBlock, Result } from "../types";
import { generateBlockId } from "../ids";
import { isSceneHeading, isTransition, isParenthetical, isNote, isCharacterCandidate } from "../editor/inference";

interface ParseFountainOptions {
  maxSizeBytes?: number;
}

export function parseFountain(
  rawText: string,
  options: ParseFountainOptions = {}
): Result<{ title: string; blocks: ScriptBlock[] }> {
  try {
    const maxBytes = options.maxSizeBytes ?? 5 * 1024 * 1024; // 5MB
    if (new Blob([rawText]).size > maxBytes) {
      return { ok: false, error: "File exceeds 5MB limit." };
    }

    const lines = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    let title = "Untitled script";
    let lineIndex = 0;

    const titlePageKeyRegex = /^([A-Za-z\s]+):\s*(.*)$/;
    if (lines.length > 0 && titlePageKeyRegex.test(lines[0])) {
      while (lineIndex < lines.length) {
        const line = lines[lineIndex];
        if (line.trim() === "") {
          lineIndex++;
          break;
        }
        const match = line.match(titlePageKeyRegex);
        if (match) {
          const key = match[1].trim().toLowerCase();
          const val = match[2].trim();
          if (key === "title") {
            title = val || "Untitled script";
          }
        }
        lineIndex++;
      }
    }

    const blocks: ScriptBlock[] = [];
    let state: "none" | "character" | "dialogue" = "none";

    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      const trimmed = line.trim();

      if (!trimmed) {
        state = "none";
        lineIndex++;
        continue;
      }

      if (isNote(trimmed)) {
        blocks.push({
          id: generateBlockId(),
          type: "note",
          text: trimmed.slice(2, -2).trim(),
        });
        state = "none";
        lineIndex++;
        continue;
      }

      if (isSceneHeading(trimmed)) {
        const headingText = trimmed.startsWith(".") ? trimmed.slice(1).trim() : trimmed;
        blocks.push({
          id: generateBlockId(),
          type: "scene_heading",
          text: headingText.toUpperCase(),
        });
        state = "none";
        lineIndex++;
        continue;
      }

      if (isTransition(trimmed)) {
        const transText = trimmed.startsWith(">") ? trimmed.slice(1).trim() : trimmed;
        blocks.push({
          id: generateBlockId(),
          type: "transition",
          text: transText.toUpperCase(),
        });
        state = "none";
        lineIndex++;
        continue;
      }

      const isForcedChar = trimmed.startsWith("@");
      const isChar = isForcedChar || (isCharacterCandidate(trimmed) && state === "none");

      if (isChar) {
        const charName = isForcedChar ? trimmed.slice(1).trim() : trimmed;
        blocks.push({
          id: generateBlockId(),
          type: "character",
          text: charName.toUpperCase(),
        });
        state = "character";
        lineIndex++;
        continue;
      }

      if (isParenthetical(trimmed) && (state === "character" || state === "dialogue")) {
        blocks.push({
          id: generateBlockId(),
          type: "parenthetical",
          text: trimmed,
        });
        state = "character";
        lineIndex++;
        continue;
      }

      if (state === "character" || state === "dialogue") {
        blocks.push({
          id: generateBlockId(),
          type: "dialogue",
          text: trimmed,
        });
        state = "dialogue";
        lineIndex++;
        continue;
      }

      blocks.push({
        id: generateBlockId(),
        type: "action",
        text: trimmed,
      });
      lineIndex++;
    }

    if (blocks.length === 0) {
      blocks.push({
        id: generateBlockId(),
        type: "action",
        text: "",
      });
    }

    return {
      ok: true,
      value: {
        title,
        blocks,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to parse Fountain file.";
    return { ok: false, error: msg };
  }
}