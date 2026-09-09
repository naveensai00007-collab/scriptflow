import type { ScriptBlock, BlockType, Result } from "../types";
import { generateBlockId } from "../ids";

interface ParseFDXOptions {
  maxSizeBytes?: number;
}

export function parseFDX(
  xmlContent: string,
  options: ParseFDXOptions = {}
): Result<{ title: string; blocks: ScriptBlock[] }> {
  try {
    const maxBytes = options.maxSizeBytes ?? 5 * 1024 * 1024; // 5MB
    if (new Blob([xmlContent]).size > maxBytes) {
      return { ok: false, error: "File exceeds 5MB limit." };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, "application/xml");

    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      return {
        ok: false,
        error: "XML parse error: " + (parseError.textContent || "Invalid XML format."),
      };
    }

    const paragraphs = doc.querySelectorAll("Paragraph");
    if (!paragraphs || paragraphs.length === 0) {
      return {
        ok: true,
        value: {
          title: "Untitled script",
          blocks: [
            {
              id: generateBlockId(),
              type: "action",
              text: "",
            },
          ],
        },
      };
    }

    const blocks: ScriptBlock[] = [];

    paragraphs.forEach((p) => {
      const typeAttr = p.getAttribute("Type") || "Action";
      let blockType: BlockType = "action";

      switch (typeAttr.toLowerCase()) {
        case "scene heading":
          blockType = "scene_heading";
          break;
        case "action":
        case "general":
          blockType = "action";
          break;
        case "character":
          blockType = "character";
          break;
        case "dialogue":
          blockType = "dialogue";
          break;
        case "parenthetical":
          blockType = "parenthetical";
          break;
        case "transition":
          blockType = "transition";
          break;
        default:
          blockType = "action";
          break;
      }

      // Collect all text from <Text> tags inside the paragraph
      const textNodes = p.querySelectorAll("Text");
      let paragraphText = "";
      if (textNodes.length > 0) {
        textNodes.forEach((t) => {
          paragraphText += t.textContent || "";
        });
      } else {
        paragraphText = p.textContent || "";
      }

      const cleanText = paragraphText.trim();
      if (cleanText) {
        blocks.push({
          id: generateBlockId(),
          type: blockType,
          text: blockType === "scene_heading" || blockType === "character" || blockType === "transition"
            ? cleanText.toUpperCase()
            : cleanText,
        });
      }
    });

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
        title: "Untitled script",
        blocks,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to parse Final Draft file.";
    return { ok: false, error: msg };
  }
}
