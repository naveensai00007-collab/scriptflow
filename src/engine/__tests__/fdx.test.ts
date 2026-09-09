import { describe, it, expect } from "vitest";
import { parseFDX } from "../parse/fdx";
import { exportFDX } from "../export/fdx";
import type { ScriptRecord } from "../types";

describe("FDX Interchange", () => {
  it("exports screenplay to valid XML FDX structure", () => {
    const script: ScriptRecord = {
      id: "fdx-id",
      title: "Test FDX",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [
        { id: "1", type: "scene_heading", text: "INT. LAB - DAY" },
        { id: "2", type: "action", text: "Flasks bubble & hum." },
        { id: "3", type: "character", text: "DOC" },
        { id: "4", type: "dialogue", text: "It works!" },
        { id: "5", type: "note", text: "This note should be excluded from FDX" },
      ],
      beatMeta: {},
      characterMeta: {},
    };

    const xml = exportFDX(script);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<Paragraph Type="Scene Heading">');
    expect(xml).toContain('<Text>INT. LAB - DAY</Text>');
    expect(xml).toContain("&amp; hum."); // escaped &
    expect(xml).toContain('<Paragraph Type="Character">');
    expect(xml).not.toContain("This note should be excluded");
  });

  it("parses valid FDX XML", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. OFFICE - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Phones ring loudly.</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>BOSS</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Get back to work!</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

    const parsed = parseFDX(xml);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.blocks.length).toBe(4);
      expect(parsed.value.blocks[0].type).toBe("scene_heading");
      expect(parsed.value.blocks[1].type).toBe("action");
      expect(parsed.value.blocks[2].type).toBe("character");
      expect(parsed.value.blocks[3].type).toBe("dialogue");
    }
  });
});
