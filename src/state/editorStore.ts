import { create } from "zustand";
import type {
  ScriptRecord,
  ScriptBlock,
  BlockType,
  BeatMeta,
  CharacterMeta,
  SaveStatus,
  DerivedScene,
  DerivedCharacter,
  PaginationResult,
  VersionSnapshot,
  ScratchItem,
  MoodboardItem,
  CallSheet,
} from "../engine/types";
import { generateId } from "../engine/ids";
import { db } from "../engine/storage/db";
import { saveQueue } from "../engine/storage/saveQueue";
import { readCrashBuffer, clearCrashBuffer, saveCrashBuffer } from "../engine/storage/crashBuffer";
import { HistoryManager } from "../engine/editor/history";
import {
  createInitialBlock,
  updateBlockText,
  changeBlockType as blockOpsChangeType,
  splitBlock as blockOpsSplit,
  mergeWithPrevious,
  deleteBlock as blockOpsDelete,
  reorderScenes,
  cycleBlockType,
  toggleDualDialogue,
  renameCharacterAcrossScript,
  mergeCharactersAcrossScript,
} from "../engine/editor/blockOps";
import { deriveScenes } from "../engine/derive/scenes";
import { deriveCharacters } from "../engine/derive/characters";
import { computePagination } from "../engine/derive/pagination";

function countWords(blocks: ScriptBlock[]): number {
  return blocks.reduce((acc, b) => {
    const words = b.text.trim().split(/\s+/).filter(Boolean);
    return acc + words.length;
  }, 0);
}

interface EditorState {
  currentScript: ScriptRecord | null;
  saveStatus: SaveStatus;
  activeBlockId: string | null;
  activeCaretPos: number;
  canUndo: boolean;
  canRedo: boolean;
  isStorageError: boolean;
  storageErrorMessage: string | null;
  derivedScenes: DerivedScene[];
  derivedCharacters: DerivedCharacter[];
  pagination: PaginationResult;
  recoveredChanges: boolean;
  viewMode: "script" | "corkboard" | "breakdown";
  isZenMode: boolean;
  isTypewriterMode: boolean;
  isNightWarmMode: boolean;
  isScratchDrawerOpen: boolean;
  autoSaveIntervalSeconds: number;

  // Actions
  setViewMode: (mode: "script" | "corkboard" | "breakdown") => void;
  setZenMode: (zen: boolean) => void;
  setTypewriterMode: (enabled: boolean) => void;
  setNightWarmMode: (enabled: boolean) => void;
  setScratchDrawerOpen: (open: boolean) => void;
  setAutoSaveIntervalSeconds: (seconds: number) => void;
  loadScript: (id: string) => Promise<boolean>;
  createNewScript: (initialTitle?: string, initialBlocks?: ScriptBlock[]) => Promise<string | null>;
  deleteScript: (id: string) => Promise<boolean>;
  updateTitle: (newTitle: string) => void;
  updateMetadata: (meta: Partial<Pick<ScriptRecord, "writtenBy" | "contactInfo" | "logline" | "watermarkText" | "revisionDraft" | "isRevisionMode" | "lockSceneNumbers" | "autoSaveIntervalSeconds">>) => void;
  updateBlock: (blockId: string, text: string) => void;
  setBlockType: (blockId: string, type: BlockType) => void;
  cycleBlockTypeAt: (blockId: string, direction?: "forward" | "backward") => void;
  toggleDualDialogueAt: (blockId: string) => void;
  renameCharacter: (oldName: string, newName: string) => void;
  mergeCharacters: (sourceName: string, targetName: string) => void;
  splitBlockAt: (blockId: string, caretPos: number) => void;
  mergeBlockAt: (blockId: string) => void;
  removeBlock: (blockId: string) => void;
  reorderSceneDirection: (sceneId: string, direction: "up" | "down") => boolean;
  updateBeatMetadata: (sceneId: string, meta: Partial<BeatMeta>) => void;
  updateCharacterMetadata: (charId: string, meta: Partial<CharacterMeta>) => void;
  setActiveBlock: (id: string | null, caretPos?: number) => void;
  undo: () => void;
  redo: () => void;
  saveNow: () => Promise<void>;
  dismissRecoveryNotice: () => void;

  // Snapshots
  createSnapshot: (name: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;

  // Scratch Pad / Bin
  addScratchItem: (title: string, content: string) => void;
  updateScratchItem: (id: string, title: string, content: string) => void;
  deleteScratchItem: (id: string) => void;

  // Moodboard
  addMoodboardItem: (item: Omit<MoodboardItem, "id">) => void;
  deleteMoodboardItem: (id: string) => void;

  // Call Sheets
  saveCallSheet: (callSheet: CallSheet) => void;
  deleteCallSheet: (id: string) => void;

  // Scene Numbering
  toggleLockSceneNumbers: () => void;
  updateSceneNumber: (blockId: string, customNumber: string) => void;
}

const historyManager = new HistoryManager(50);
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const initialPagination: PaginationResult = {
  totalPages: 1,
  blockPageMap: {},
  pageBreakAfterBlocks: new Set(),
  scenePageMap: {},
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentScript: null,
  saveStatus: "saved",
  activeBlockId: null,
  activeCaretPos: 0,
  canUndo: false,
  canRedo: false,
  isStorageError: false,
  storageErrorMessage: null,
  derivedScenes: [],
  derivedCharacters: [],
  pagination: initialPagination,
  recoveredChanges: false,
  viewMode: "script",
  isZenMode: false,
  isTypewriterMode: false,
  isNightWarmMode: false,
  isScratchDrawerOpen: false,
  autoSaveIntervalSeconds: 30,

  setViewMode: (viewMode) => set({ viewMode }),
  setZenMode: (isZenMode) => set({ isZenMode }),
  setTypewriterMode: (isTypewriterMode) => set({ isTypewriterMode }),
  setNightWarmMode: (isNightWarmMode) => set({ isNightWarmMode }),
  setScratchDrawerOpen: (isScratchDrawerOpen) => set({ isScratchDrawerOpen }),
  setAutoSaveIntervalSeconds: (autoSaveIntervalSeconds) => {
    set({ autoSaveIntervalSeconds });
    get().updateMetadata({ autoSaveIntervalSeconds });
  },
  dismissRecoveryNotice: () => set({ recoveredChanges: false }),

  setActiveBlock: (id, caretPos = 0) => {
    set({ activeBlockId: id, activeCaretPos: caretPos });
  },

  loadScript: async (id: string) => {
    try {
      set({ saveStatus: "saving" });
      const record = await db.scripts.get(id);
      if (!record) {
        set({ saveStatus: "saved" });
        return false;
      }

      const crash = readCrashBuffer(id);
      let scriptToUse = record;
      let recovered = false;

      if (crash) {
        const crashTime = crash.timestamp;
        const dbTime = new Date(record.updatedAt).getTime();
        if (crashTime > dbTime) {
          scriptToUse = crash.record;
          recovered = true;
        }
      }

      historyManager.clear();

      const pagination = computePagination(scriptToUse.blocks);
      const derivedScenes = deriveScenes(scriptToUse.blocks, scriptToUse.beatMeta, pagination.scenePageMap);
      const derivedCharacters = deriveCharacters(scriptToUse.blocks);

      set({
        currentScript: scriptToUse,
        saveStatus: recovered ? "unsaved" : "saved",
        activeBlockId: scriptToUse.blocks[0]?.id || null,
        activeCaretPos: 0,
        canUndo: false,
        canRedo: false,
        isStorageError: false,
        storageErrorMessage: null,
        derivedScenes,
        derivedCharacters,
        pagination,
        recoveredChanges: recovered,
        autoSaveIntervalSeconds: scriptToUse.autoSaveIntervalSeconds || 30,
      });

      if (recovered) {
        get().saveNow();
      }

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not open script.";
      set({
        isStorageError: true,
        storageErrorMessage: msg,
        saveStatus: "error",
      });
      return false;
    }
  },

  createNewScript: async (initialTitle = "", initialBlocks) => {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      const blocks = initialBlocks && initialBlocks.length > 0 ? initialBlocks : [createInitialBlock()];

      const newRecord: ScriptRecord = {
        id,
        title: initialTitle.slice(0, 200),
        writtenBy: "",
        contactInfo: "",
        logline: "",
        revisionDraft: "White",
        isRevisionMode: false,
        snapshots: [],
        scratchItems: [],
        moodboardItems: [],
        callSheets: [],
        createdAt: now,
        updatedAt: now,
        blocks,
        beatMeta: {},
        characterMeta: {},
      };

      await db.scripts.put(newRecord);
      return id;
    } catch (err: unknown) {
      console.error("Failed to create script", err);
      return null;
    }
  },

  deleteScript: async (id: string) => {
    try {
      await db.scripts.delete(id);
      clearCrashBuffer(id);
      if (get().currentScript?.id === id) {
        set({ currentScript: null, activeBlockId: null });
      }
      return true;
    } catch {
      return false;
    }
  },

  updateTitle: (newTitle: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const clampedTitle = newTitle.slice(0, 200);
    const updated = { ...currentScript, title: clampedTitle };

    set({ currentScript: updated, saveStatus: "unsaved" });
    saveCrashBuffer(updated);

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      get().saveNow();
    }, 500);
  },

  updateMetadata: (meta) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const updated = { ...currentScript, ...meta };
    set({ currentScript: updated, saveStatus: "unsaved" });
    saveCrashBuffer(updated);

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      get().saveNow();
    }, 500);
  },

  updateBlock: (blockId: string, text: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const isRev = currentScript.isRevisionMode || false;
    const revDraft = currentScript.revisionDraft || "White";

    const newBlocks = updateBlockText(currentScript.blocks, blockId, text, isRev, revDraft);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: newBlocks };

    const pagination = computePagination(newBlocks);
    const derivedScenes = deriveScenes(newBlocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(newBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    saveCrashBuffer(updatedScript);

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      get().saveNow();
    }, 500);
  },

  setBlockType: (blockId: string, type: BlockType) => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const newBlocks = blockOpsChangeType(currentScript.blocks, blockId, type);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: newBlocks };

    const pagination = computePagination(newBlocks);
    const derivedScenes = deriveScenes(newBlocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(newBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  cycleBlockTypeAt: (blockId: string, direction = "forward") => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const newBlocks = cycleBlockType(currentScript.blocks, blockId, direction);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: newBlocks };

    const pagination = computePagination(newBlocks);
    const derivedScenes = deriveScenes(newBlocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(newBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  toggleDualDialogueAt: (blockId: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const newBlocks = toggleDualDialogue(currentScript.blocks, blockId);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: newBlocks };

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
    get().saveNow();
  },

  renameCharacter: (oldName: string, newName: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const newBlocks = renameCharacterAcrossScript(currentScript.blocks, oldName, newName);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: newBlocks };

    const derivedCharacters = deriveCharacters(newBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedCharacters,
    });
    get().saveNow();
  },

  mergeCharacters: (sourceName: string, targetName: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const newBlocks = mergeCharactersAcrossScript(currentScript.blocks, sourceName, targetName);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: newBlocks };

    const derivedCharacters = deriveCharacters(newBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedCharacters,
    });
    get().saveNow();
  },

  splitBlockAt: (blockId: string, caretPos: number) => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const res = blockOpsSplit(currentScript.blocks, blockId, caretPos);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: res.blocks };

    const pagination = computePagination(res.blocks);
    const derivedScenes = deriveScenes(res.blocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(res.blocks);

    set({
      currentScript: updatedScript,
      activeBlockId: res.focusBlockId,
      activeCaretPos: res.focusCaretPos,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  mergeBlockAt: (blockId: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const res = mergeWithPrevious(currentScript.blocks, blockId);
    if (!res) return;

    historyManager.push(currentScript.blocks);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: res.blocks };

    const pagination = computePagination(res.blocks);
    const derivedScenes = deriveScenes(res.blocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(res.blocks);

    set({
      currentScript: updatedScript,
      activeBlockId: res.focusBlockId,
      activeCaretPos: res.focusCaretPos,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  removeBlock: (blockId: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    historyManager.push(currentScript.blocks);
    const res = blockOpsDelete(currentScript.blocks, blockId);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: res.blocks };

    const pagination = computePagination(res.blocks);
    const derivedScenes = deriveScenes(res.blocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(res.blocks);

    set({
      currentScript: updatedScript,
      activeBlockId: res.focusBlockId,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  reorderSceneDirection: (sceneId: string, direction: "up" | "down") => {
    const { currentScript } = get();
    if (!currentScript) return false;

    const res = reorderScenes(currentScript.blocks, sceneId, direction);
    if (!res.ok) {
      return false;
    }

    historyManager.push(currentScript.blocks);
    const updatedScript: ScriptRecord = { ...currentScript, blocks: res.value };

    const pagination = computePagination(res.value);
    const derivedScenes = deriveScenes(res.value, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(res.value);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
    return true;
  },

  updateBeatMetadata: (sceneId: string, meta: Partial<BeatMeta>) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const existing = currentScript.beatMeta[sceneId] || { note: "", color: "none" };
    const merged: BeatMeta = {
      note: meta.note !== undefined ? meta.note.slice(0, 500) : existing.note,
      color: meta.color !== undefined ? meta.color : existing.color,
    };

    const newBeatMeta = { ...currentScript.beatMeta, [sceneId]: merged };
    const updatedScript: ScriptRecord = { ...currentScript, beatMeta: newBeatMeta };

    const derivedScenes = deriveScenes(currentScript.blocks, newBeatMeta, get().pagination.scenePageMap);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      derivedScenes,
    });

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      get().saveNow();
    }, 500);
  },

  updateCharacterMetadata: (charId: string, meta: Partial<CharacterMeta>) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const existing = currentScript.characterMeta[charId] || { note: "", color: "none" };
    const merged: CharacterMeta = {
      note: meta.note !== undefined ? meta.note.slice(0, 500) : existing.note,
      color: meta.color !== undefined ? meta.color : existing.color,
    };

    const newCharMeta = { ...currentScript.characterMeta, [charId]: merged };
    const updatedScript: ScriptRecord = { ...currentScript, characterMeta: newCharMeta };

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
    });

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      get().saveNow();
    }, 500);
  },

  undo: () => {
    const { currentScript } = get();
    if (!currentScript) return;

    const previousBlocks = historyManager.undo(currentScript.blocks);
    if (!previousBlocks) return;

    const updatedScript: ScriptRecord = { ...currentScript, blocks: previousBlocks };
    const pagination = computePagination(previousBlocks);
    const derivedScenes = deriveScenes(previousBlocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(previousBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  redo: () => {
    const { currentScript } = get();
    if (!currentScript) return;

    const nextBlocks = historyManager.redo(currentScript.blocks);
    if (!nextBlocks) return;

    const updatedScript: ScriptRecord = { ...currentScript, blocks: nextBlocks };
    const pagination = computePagination(nextBlocks);
    const derivedScenes = deriveScenes(nextBlocks, updatedScript.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(nextBlocks);

    set({
      currentScript: updatedScript,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      derivedScenes,
      derivedCharacters,
      pagination,
    });
    get().saveNow();
  },

  saveNow: async () => {
    const { currentScript } = get();
    if (!currentScript) return;

    set({ saveStatus: "saving" });
    const res = await saveQueue.save(currentScript);
    if (res.ok) {
      set({
        currentScript: res.value,
        saveStatus: "saved",
        isStorageError: false,
        storageErrorMessage: null,
      });
    } else {
      set({
        saveStatus: "error",
        isStorageError: true,
        storageErrorMessage: res.error,
      });
    }
  },

  // Snapshots
  createSnapshot: (name: string) => {
    const { currentScript, derivedScenes } = get();
    if (!currentScript) return;

    const newSnapshot: VersionSnapshot = {
      id: generateId(),
      name: name.trim() || `Draft ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      timestamp: new Date().toISOString(),
      blocks: structuredClone(currentScript.blocks),
      sceneCount: derivedScenes.length,
      wordCount: countWords(currentScript.blocks),
    };

    const snapshots = [newSnapshot, ...(currentScript.snapshots || [])];
    const updated = { ...currentScript, snapshots };
    set({ currentScript: updated });
    get().saveNow();
  },

  restoreSnapshot: (snapshotId: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const snapshot = (currentScript.snapshots || []).find((s) => s.id === snapshotId);
    if (!snapshot) return;

    historyManager.push(currentScript.blocks);
    const restoredBlocks = structuredClone(snapshot.blocks);
    const updated: ScriptRecord = { ...currentScript, blocks: restoredBlocks };

    const pagination = computePagination(restoredBlocks);
    const derivedScenes = deriveScenes(restoredBlocks, updated.beatMeta, pagination.scenePageMap);
    const derivedCharacters = deriveCharacters(restoredBlocks);

    set({
      currentScript: updated,
      derivedScenes,
      derivedCharacters,
      pagination,
      saveStatus: "unsaved",
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
    get().saveNow();
  },

  deleteSnapshot: (snapshotId: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const snapshots = (currentScript.snapshots || []).filter((s) => s.id !== snapshotId);
    const updated = { ...currentScript, snapshots };
    set({ currentScript: updated });
    get().saveNow();
  },

  // Scratch Pad / Bin
  addScratchItem: (title: string, content: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const newItem: ScratchItem = {
      id: generateId(),
      title: title.trim() || "Untitled Snippet",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const scratchItems = [newItem, ...(currentScript.scratchItems || [])];
    const updated = { ...currentScript, scratchItems };
    set({ currentScript: updated });
    get().saveNow();
  },

  updateScratchItem: (id: string, title: string, content: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const scratchItems = (currentScript.scratchItems || []).map((item) =>
      item.id === id ? { ...item, title: title.trim() || item.title, content } : item
    );
    const updated = { ...currentScript, scratchItems };
    set({ currentScript: updated });
    get().saveNow();
  },

  deleteScratchItem: (id: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const scratchItems = (currentScript.scratchItems || []).filter((item) => item.id !== id);
    const updated = { ...currentScript, scratchItems };
    set({ currentScript: updated });
    get().saveNow();
  },

  // Moodboard
  addMoodboardItem: (item) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const newItem: MoodboardItem = {
      ...item,
      id: generateId(),
    };

    const moodboardItems = [...(currentScript.moodboardItems || []), newItem];
    const updated = { ...currentScript, moodboardItems };
    set({ currentScript: updated });
    get().saveNow();
  },

  deleteMoodboardItem: (id: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const moodboardItems = (currentScript.moodboardItems || []).filter((item) => item.id !== id);
    const updated = { ...currentScript, moodboardItems };
    set({ currentScript: updated });
    get().saveNow();
  },

  // Call Sheets
  saveCallSheet: (callSheet) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const existing = currentScript.callSheets || [];
    const index = existing.findIndex((c) => c.id === callSheet.id);
    let updatedList: CallSheet[];

    if (index >= 0) {
      updatedList = [...existing];
      updatedList[index] = callSheet;
    } else {
      updatedList = [callSheet, ...existing];
    }

    const updated = { ...currentScript, callSheets: updatedList };
    set({ currentScript: updated });
    get().saveNow();
  },

  deleteCallSheet: (id: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const callSheets = (currentScript.callSheets || []).filter((c) => c.id !== id);
    const updated = { ...currentScript, callSheets };
    set({ currentScript: updated });
    get().saveNow();
  },

  // Scene Numbering
  toggleLockSceneNumbers: () => {
    const { currentScript } = get();
    if (!currentScript) return;

    const lock = !currentScript.lockSceneNumbers;
    let blockNumber = 1;

    const newBlocks = currentScript.blocks.map((block) => {
      if (block.type === "scene_heading") {
        if (lock && !block.sceneNumber) {
          const num = `${blockNumber}`;
          blockNumber++;
          return { ...block, sceneNumber: num };
        }
      }
      return block;
    });

    const updated = { ...currentScript, lockSceneNumbers: lock, blocks: newBlocks };
    set({ currentScript: updated });
    get().saveNow();
  },

  updateSceneNumber: (blockId: string, customNumber: string) => {
    const { currentScript } = get();
    if (!currentScript) return;

    const newBlocks = currentScript.blocks.map((b) =>
      b.id === blockId ? { ...b, sceneNumber: customNumber.trim() } : b
    );

    const updated = { ...currentScript, blocks: newBlocks };
    set({ currentScript: updated });
    get().saveNow();
  },
}));