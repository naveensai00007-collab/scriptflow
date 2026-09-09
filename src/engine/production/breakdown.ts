import type { ScriptBlock, BreakdownItem, CallSheet, BreakdownCategory } from "../types";
import { generateId } from "../ids";

const PROP_KEYWORDS = [
  "gun", "revolver", "pistol", "rifle", "knife", "blade", "briefcase", "suitcase",
  "phone", "smartphone", "letter", "envelope", "key", "keys", "badge", "wallet",
  "money", "cash", "glass", "bottle", "cigarette", "lighter", "coffee", "cup",
  "laptop", "computer", "book", "camera", "flashlight", "watch", "ring",
];

const VEHICLE_KEYWORDS = [
  "car", "sedan", "truck", "van", "motorcycle", "bike", "taxi", "cab",
  "police car", "cruiser", "ambulance", "helicopter", "airplane", "subway", "train", "boat",
];

const WARDROBE_KEYWORDS = [
  "uniform", "suit", "tuxedo", "dress", "gown", "coat", "jacket", "hoodie",
  "disguise", "mask", "gloves", "boots", "sunglasses", "hat", "helmet",
];

const STUNT_KEYWORDS = [
  "explosion", "explodes", "gunfire", "shoots", "shot", "crash", "crashes",
  "punch", "punches", "kicks", "fight", "fights", "tackles", "falls", "jump", "leaps",
];

export function generateScriptBreakdown(blocks: ScriptBlock[]): BreakdownItem[] {
  const itemsMap = new Map<string, BreakdownItem>();
  let currentSceneNumber: number | string = 1;

  for (const block of blocks) {
    if (block.type === "scene_heading") {
      currentSceneNumber = block.sceneNumber || currentSceneNumber;

      // Set / Location category
      const locationMatch = block.text.replace(/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E)\s*/i, "").split("-")[0]?.trim();
      if (locationMatch) {
        const key = `set:${locationMatch.toUpperCase()}`;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            id: generateId(),
            category: "set",
            name: locationMatch.toUpperCase(),
            sceneNumbers: [currentSceneNumber],
          });
        } else {
          const item = itemsMap.get(key)!;
          if (!item.sceneNumbers.includes(currentSceneNumber)) {
            item.sceneNumbers.push(currentSceneNumber);
          }
        }
      }
    } else if (block.type === "character") {
      // Cast category
      const charName = block.text.replace(/\s*\(.*?\)/g, "").trim().toUpperCase();
      if (charName) {
        const key = `cast:${charName}`;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            id: generateId(),
            category: "cast",
            name: charName,
            sceneNumbers: [currentSceneNumber],
          });
        } else {
          const item = itemsMap.get(key)!;
          if (!item.sceneNumbers.includes(currentSceneNumber)) {
            item.sceneNumbers.push(currentSceneNumber);
          }
        }
      }
    } else if (block.type === "action") {
      const textLower = block.text.toLowerCase();

      const scanCategory = (keywords: string[], cat: BreakdownCategory) => {
        for (const kw of keywords) {
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          if (regex.test(textLower)) {
            const name = kw.toUpperCase();
            const key = `${cat}:${name}`;
            if (!itemsMap.has(key)) {
              itemsMap.set(key, {
                id: generateId(),
                category: cat,
                name,
                sceneNumbers: [currentSceneNumber],
              });
            } else {
              const item = itemsMap.get(key)!;
              if (!item.sceneNumbers.includes(currentSceneNumber)) {
                item.sceneNumbers.push(currentSceneNumber);
              }
            }
          }
        }
      };

      scanCategory(PROP_KEYWORDS, "prop");
      scanCategory(VEHICLE_KEYWORDS, "vehicle");
      scanCategory(WARDROBE_KEYWORDS, "wardrobe");
      scanCategory(STUNT_KEYWORDS, "stunt");
    }
  }

  return Array.from(itemsMap.values());
}

export function createDefaultCallSheet(
  shootDay = 1,
  location = "Soundstage / Location Alpha",
  scenes: string[] = ["Scene 1", "Scene 2"],
  castMembers: string[] = ["Lead Actor", "Supporting Actor"]
): CallSheet {
  return {
    id: generateId(),
    shootDay,
    date: new Date().toISOString().split("T")[0],
    callTime: "07:00 AM",
    location,
    scenes,
    cast: castMembers.map((name, idx) => ({
      name,
      role: `Character ${idx + 1}`,
      callTime: `${7 + idx}:00 AM`,
    })),
    notes: "Breakfast served 06:30 AM. First shot rehearses at 07:45 AM sharp.",
  };
}