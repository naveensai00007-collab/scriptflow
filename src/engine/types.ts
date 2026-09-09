export type BlockType =
  | "scene_heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "note";

export interface ScriptBlock {
  id: string;
  type: BlockType;
  text: string;
  isDualDialogue?: boolean;
  isRevised?: boolean;
  revisionDraft?: string;
  sceneNumber?: string; // e.g. "23", "23A", "23B"
}

export type BeatColor =
  | "none"
  | "slate"
  | "amber"
  | "emerald"
  | "rose"
  | "sky";

export interface BeatMeta {
  note: string; // max 500
  color: BeatColor;
}

export interface CharacterMeta {
  note: string; // max 500
  color: BeatColor;
}

export type RevisionColor =
  | "White"
  | "Blue"
  | "Pink"
  | "Yellow"
  | "Green"
  | "Goldenrod"
  | "Buff"
  | "Salmon"
  | "Cherry";

export interface VersionSnapshot {
  id: string;
  name: string;
  timestamp: string;
  blocks: ScriptBlock[];
  sceneCount: number;
  wordCount: number;
}

export interface ScratchItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export type BreakdownCategory =
  | "cast"
  | "set"
  | "prop"
  | "wardrobe"
  | "vehicle"
  | "stunt";

export interface BreakdownItem {
  id: string;
  category: BreakdownCategory;
  name: string;
  sceneNumbers: (number | string)[];
  notes?: string;
}

export interface CallSheet {
  id: string;
  shootDay: number;
  date: string;
  callTime: string;
  location: string;
  scenes: string[];
  cast: { name: string; role: string; callTime: string }[];
  notes?: string;
}

export interface MoodboardItem {
  id: string;
  title: string;
  imageUrl?: string;
  colorHex?: string;
  note?: string;
  category: "character" | "location" | "tone" | "prop";
}

export interface StoryBeat {
  id: string;
  title: string;
  act: string;
  description: string;
  pageEstimate: string;
  completed?: boolean;
}

export interface ScriptRecord {
  id: string; // UUID
  title: string; // max 200 chars
  writtenBy?: string;
  contactInfo?: string;
  logline?: string;
  revisionDraft?: RevisionColor;
  isRevisionMode?: boolean;
  watermarkText?: string;
  lockSceneNumbers?: boolean;
  autoSaveIntervalSeconds?: number;
  snapshots?: VersionSnapshot[];
  scratchItems?: ScratchItem[];
  moodboardItems?: MoodboardItem[];
  callSheets?: CallSheet[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  blocks: ScriptBlock[];
  beatMeta: Record<string, BeatMeta>;
  characterMeta: Record<string, CharacterMeta>;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export interface DerivedScene {
  id: string; // scene heading block id, or "prologue"
  number: number; // 0 for prologue, otherwise 1-based
  customNumber?: string; // e.g. "23A"
  heading: string;
  synopsis: string;
  startBlockId: string;
  endBlockIdExclusive: string | null;
  isPrologue: boolean;
  pageNumber?: number;
  isFlashback?: boolean;
  isParallelTimeline?: boolean;
}

export interface CharacterOccurrence {
  blockId: string;
  sceneNumber: number | string;
}

export interface DerivedCharacter {
  id: string; // normalized uppercase name
  name: string;
  dialogueCount: number;
  sceneNumbers: (number | string)[];
  firstBlockId: string;
  lastBlockId: string;
  occurrences: CharacterOccurrence[];
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: number; // 12 - 24, default 14
  showHints: boolean;
  structureOpen: boolean;
  activeStructureTab: "beats" | "characters" | "outline" | "navigator" | "breakdown";
  typewriterMode: boolean;
  autoSaveIntervalSeconds: number; // default 60
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface PaginationResult {
  totalPages: number;
  blockPageMap: Record<string, number>;
  pageBreakAfterBlocks: Set<string>;
  scenePageMap: Record<string, number>;
}