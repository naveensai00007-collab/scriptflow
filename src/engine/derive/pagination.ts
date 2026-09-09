import type { ScriptBlock, PaginationResult } from "../types";

const LINES_PER_PAGE = 54;

function calculateBlockLines(block: ScriptBlock): number {
  if (block.type === "note") return 0;

  const text = block.text.trim();
  if (!text) return 1;

  switch (block.type) {
    case "scene_heading":
      // 1 line text + 2 empty lines before + 1 empty line after
      return 4;
    case "action": {
      // ~60 characters per action line
      const lineCount = Math.max(1, Math.ceil(text.length / 60));
      return lineCount + 1; // + 1 line spacing
    }
    case "character":
      return 2; // 1 text + 1 top spacing
    case "dialogue": {
      // ~35 characters per dialogue line
      const lineCount = Math.max(1, Math.ceil(text.length / 35));
      return lineCount + 1; // + 1 bottom spacing
    }
    case "parenthetical":
      return 1;
    case "transition":
      return 2;
    default:
      return 1;
  }
}

export function computePagination(blocks: ScriptBlock[]): PaginationResult {
  const blockPageMap: Record<string, number> = {};
  const pageBreakAfterBlocks = new Set<string>();
  const scenePageMap: Record<string, number> = {};

  let currentPage = 1;
  let currentLinesOnPage = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockLines = calculateBlockLines(block);

    // Track starting page of scenes
    if (block.type === "scene_heading") {
      scenePageMap[block.id] = currentPage;
    }

    // Check if adding this block overflows the page
    if (currentLinesOnPage > 0 && currentLinesOnPage + blockLines > LINES_PER_PAGE) {
      // Page break before this block
      const prevBlock = blocks[i - 1];
      if (prevBlock) {
        pageBreakAfterBlocks.add(prevBlock.id);
      }
      currentPage++;
      currentLinesOnPage = blockLines;

      if (block.type === "scene_heading") {
        scenePageMap[block.id] = currentPage;
      }
    } else {
      currentLinesOnPage += blockLines;
    }

    blockPageMap[block.id] = currentPage;
  }

  return {
    totalPages: Math.max(1, currentPage),
    blockPageMap,
    pageBreakAfterBlocks,
    scenePageMap,
  };
}