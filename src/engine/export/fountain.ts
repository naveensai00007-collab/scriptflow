import type { ScriptRecord } from "../types";

export function exportFountain(script: ScriptRecord): string {
  const parts: string[] = [];

  if (script.title && script.title.trim() && script.title !== "Untitled script") {
    parts.push(`Title: ${script.title.trim()}`);
    parts.push(`Credit: Written with ScriptFlow\n`);
  }

  for (const block of script.blocks) {
    const text = block.text.trim();
    if (!text && block.type !== "scene_heading") continue;

    switch (block.type) {
      case "scene_heading":
        parts.push(`\n${text.toUpperCase()}\n`);
        break;
      case "action":
        parts.push(`\n${text}\n`);
        break;
      case "character":
        parts.push(`\n${text.toUpperCase()}`);
        break;
      case "dialogue":
        parts.push(`${text}`);
        break;
      case "parenthetical": {
        let p = text;
        if (!p.startsWith("(")) p = `(${p}`;
        if (!p.endsWith(")")) p = `${p})`;
        parts.push(`${p}`);
        break;
      }
      case "transition":
        parts.push(`\n> ${text.toUpperCase()}\n`);
        break;
      case "note":
        parts.push(`\n[[${text}]]\n`);
        break;
    }
  }

  return parts
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}