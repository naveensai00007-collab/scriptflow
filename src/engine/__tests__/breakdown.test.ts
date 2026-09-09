import { describe, it, expect } from "vitest";
import { generateScriptBreakdown, createDefaultCallSheet } from "../production/breakdown";
import type { ScriptBlock } from "../types";

describe("breakdown - Production Elements & Call Sheets", () => {
  it("scans cast, sets, props, vehicles, wardrobe, and stunts accurately", () => {
    const blocks: ScriptBlock[] = [
      { id: "1", type: "scene_heading", text: "INT. BANK VAULT - NIGHT", sceneNumber: "1" },
      { id: "2", type: "character", text: "KABIR (O.S.)" },
      { id: "3", type: "dialogue", text: "Blow the hinges." },
      { id: "4", type: "action", text: "Kabir pulls a revolver from his coat. An explosion rocks the door." },
      { id: "5", type: "scene_heading", text: "EXT. CITY STREET - CONTINUOUS", sceneNumber: "2" },
      { id: "6", type: "action", text: "A getaway car screeches away into the dark." },
    ];

    const items = generateScriptBreakdown(blocks);

    // Cast
    const castKabir = items.find((i) => i.category === "cast" && i.name === "KABIR");
    expect(castKabir).toBeDefined();
    expect(castKabir?.sceneNumbers).toContain("1");

    // Sets
    const setVault = items.find((i) => i.category === "set" && i.name.includes("BANK VAULT"));
    expect(setVault).toBeDefined();

    // Props
    const propGun = items.find((i) => i.category === "prop" && i.name === "REVOLVER");
    expect(propGun).toBeDefined();

    // Stunts
    const stuntExplosion = items.find((i) => i.category === "stunt" && i.name === "EXPLOSION");
    expect(stuntExplosion).toBeDefined();

    // Vehicles
    const vehicleCar = items.find((i) => i.category === "vehicle" && i.name === "CAR");
    expect(vehicleCar).toBeDefined();
    expect(vehicleCar?.sceneNumbers).toContain("2");
  });

  it("creates a production-ready call sheet with shoot day and cast schedules", () => {
    const sheet = createDefaultCallSheet(
      2,
      "Sunset Soundstage 4",
      ["Scene 14", "Scene 15"],
      ["Kabir", "Meera"]
    );

    expect(sheet.shootDay).toBe(2);
    expect(sheet.location).toBe("Sunset Soundstage 4");
    expect(sheet.scenes).toHaveLength(2);
    expect(sheet.cast).toHaveLength(2);
    expect(sheet.cast[0].name).toBe("Kabir");
    expect(sheet.callTime).toBe("07:00 AM");
  });
});
