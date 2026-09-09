import { create } from "zustand";
import type { AppSettings } from "../engine/types";
import { appSettingsSchema } from "../engine/schemas";
import { db } from "../engine/storage/db";

interface SettingsState extends AppSettings {
  isInitialized: boolean;
  setTheme: (theme: AppSettings["theme"]) => void;
  setFontSize: (size: number) => void;
  setShowHints: (show: boolean) => void;
  setStructureOpen: (open: boolean) => void;
  setActiveStructureTab: (tab: AppSettings["activeStructureTab"]) => void;
  setTypewriterMode: (enabled: boolean) => void;
  setAutoSaveIntervalSeconds: (seconds: number) => void;
  initSettings: () => Promise<void>;
}

function applyThemeClass(theme: AppSettings["theme"]) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: "light",
  fontSize: 14,
  showHints: true,
  structureOpen: true,
  activeStructureTab: "beats",
  typewriterMode: false,
  autoSaveIntervalSeconds: 60,
  isInitialized: false,

  setTheme: (theme) => {
    set({ theme });
    applyThemeClass(theme);
    get().initSettings().then(() => {
      db.kv.put({ key: "settings", value: { ...get(), theme } });
    });
  },

  setFontSize: (fontSize) => {
    const clamped = Math.max(12, Math.min(24, fontSize));
    set({ fontSize: clamped });
    db.kv.put({ key: "settings", value: { ...get(), fontSize: clamped } });
  },

  setShowHints: (showHints) => {
    set({ showHints });
    db.kv.put({ key: "settings", value: { ...get(), showHints } });
  },

  setStructureOpen: (structureOpen) => {
    set({ structureOpen });
    db.kv.put({ key: "settings", value: { ...get(), structureOpen } });
  },

  setActiveStructureTab: (activeStructureTab) => {
    set({ activeStructureTab });
    db.kv.put({ key: "settings", value: { ...get(), activeStructureTab } });
  },

  setTypewriterMode: (typewriterMode) => {
    set({ typewriterMode });
    db.kv.put({ key: "settings", value: { ...get(), typewriterMode } });
  },

  setAutoSaveIntervalSeconds: (autoSaveIntervalSeconds) => {
    const clamped = Math.max(20, Math.min(600, autoSaveIntervalSeconds));
    set({ autoSaveIntervalSeconds: clamped });
    db.kv.put({ key: "settings", value: { ...get(), autoSaveIntervalSeconds: clamped } });
  },

  initSettings: async () => {
    try {
      const record = await db.kv.get("settings");
      if (record && record.value) {
        const parsed = appSettingsSchema.safeParse(record.value);
        if (parsed.success) {
          set({ ...parsed.data, isInitialized: true });
          applyThemeClass(parsed.data.theme);
          return;
        }
      }
    } catch {
      // Fallback to defaults on error
    }
    set({ isInitialized: true });
    applyThemeClass(get().theme);
  },
}));
