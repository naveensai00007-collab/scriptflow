import type { ScriptRecord } from "../types";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getFdxParagraphType(type: string): string | null {
  switch (type) {
    case "scene_heading":
      return "Scene Heading";
    case "action":
      return "Action";
    case "character":
      return "Character";
    case "dialogue":
      return "Dialogue";
    case "parenthetical":
      return "Parenthetical";
    case "transition":
      return "Transition";
    case "note":
      return null; // Notes excluded from FDX
    default:
      return "Action";
  }
}

export function exportFDX(script: ScriptRecord): string {
  const paragraphs: string[] = [];

  for (const block of script.blocks) {
    const fdxType = getFdxParagraphType(block.type);
    if (!fdxType) continue; // Skip notes

    const text = block.text.trim();
    if (!text && block.type !== "scene_heading") continue;

    // Handle multiline paragraphs
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const cleanLine = line.trim();
      const escaped = escapeXml(cleanLine);
      paragraphs.push(
        `    <Paragraph Type="${fdxType}">\n      <Text>${escaped}</Text>\n    </Paragraph>`
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
${paragraphs.join("\n")}
  </Content>
</FinalDraft>
`;
}
