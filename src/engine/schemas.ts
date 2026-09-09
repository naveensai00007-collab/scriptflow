import { z } from "zod";

export const blockTypeSchema = z.enum([
  "scene_heading",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "note",
]);

export const scriptBlockSchema = z.object({
  id: z.string().min(1),
  type: blockTypeSchema,
  text: z.string().max(20000),
  isDualDialogue: z.boolean().optional(),
  isRevised: z.boolean().optional(),
  revisionDraft: z.string().optional(),
  sceneNumber: z.string().optional(),
});

export const beatColorSchema = z.enum([
  "none",
  "slate",
  "amber",
  "emerald",
  "rose",
  "sky",
]);

export const beatMetaSchema = z.object({
  note: z.string().max(500).default(""),
  color: beatColorSchema.default("none"),
});

export const characterMetaSchema = z.object({
  note: z.string().max(500).default(""),
  color: beatColorSchema.default("none"),
});

export const revisionColorSchema = z.enum([
  "White",
  "Blue",
  "Pink",
  "Yellow",
  "Green",
  "Goldenrod",
  "Buff",
  "Salmon",
  "Cherry",
]);

export const versionSnapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  timestamp: z.string(),
  blocks: z.array(scriptBlockSchema),
  sceneCount: z.number(),
  wordCount: z.number(),
});

export const scratchItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const scriptRecordSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  title: z.string().max(200).default(""),
  writtenBy: z.string().max(200).optional(),
  contactInfo: z.string().max(500).optional(),
  logline: z.string().max(1000).optional(),
  revisionDraft: revisionColorSchema.optional().default("White"),
  isRevisionMode: z.boolean().optional().default(false),
  watermarkText: z.string().max(100).optional(),
  lockSceneNumbers: z.boolean().optional().default(false),
  autoSaveIntervalSeconds: z.number().optional().default(60),
  snapshots: z.array(versionSnapshotSchema).optional().default([]),
  scratchItems: z.array(scratchItemSchema).optional().default([]),
  moodboardItems: z.array(z.any()).optional().default([]),
  callSheets: z.array(z.any()).optional().default([]),
  createdAt: z.string().datetime().or(z.string()),
  updatedAt: z.string().datetime().or(z.string()),
  blocks: z.array(scriptBlockSchema).max(20000),
  beatMeta: z.record(z.string(), beatMetaSchema).default({}),
  characterMeta: z.record(z.string(), characterMetaSchema).default({}),
});

export const appSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  fontSize: z.number().min(12).max(24).default(14),
  showHints: z.boolean().default(true),
  structureOpen: z.boolean().default(true),
  activeStructureTab: z.enum(["beats", "characters", "outline", "navigator", "breakdown"]).default("beats"),
  typewriterMode: z.boolean().default(false),
  autoSaveIntervalSeconds: z.number().default(60),
});