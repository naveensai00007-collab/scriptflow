import { useState } from "react";
import {
  ChevronLeft,
  Undo2,
  Redo2,
  Columns2,
  Download,
  Printer,
  Keyboard,
  Settings as SettingsIcon,
  BookOpen,
  LayoutGrid,
  FileText,
  Maximize2,
  Tag,
  Sparkles,
  Clapperboard,
  Bookmark,
  History,
  Palette,
  Timer,
  Layers,
  Users2,
  Moon,
  Hash,
  Wrench,
} from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { Button } from "../ui/Button";
import { useEditorStore } from "../../state/editorStore";
import { useSettingsStore } from "../../state/settingsStore";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { ExportDialog } from "./ExportDialog";
import { TitlePageDialog } from "./TitlePageDialog";
import { AIStoryModal } from "../tools/AIStoryModal";
import { SnapshotManagerDialog } from "./SnapshotManagerDialog";
import { MoodboardModal } from "../tools/MoodboardModal";
import { SprintTimerModal } from "../tools/SprintTimerModal";
import { TemplateLibraryModal } from "../tools/TemplateLibraryModal";
import { CollabRoomModal } from "../collaboration/CollabRoomModal";
import { DictationButton } from "../tools/DictationButton";
import type { RevisionColor } from "../../engine/types";

interface EditorTopBarProps {
  onBack: () => void;
  onPrintPreview: () => void;
}

const REVISION_COLORS: RevisionColor[] = [
  "White",
  "Blue",
  "Pink",
  "Yellow",
  "Green",
  "Goldenrod",
  "Buff",
  "Salmon",
  "Cherry",
];

export function EditorTopBar({ onBack, onPrintPreview }: EditorTopBarProps) {
  const {
    currentScript,
    canUndo,
    canRedo,
    viewMode,
    isTypewriterMode,
    isNightWarmMode,
    isScratchDrawerOpen,
    setViewMode,
    setZenMode,
    setTypewriterMode,
    setNightWarmMode,
    setScratchDrawerOpen,
    toggleLockSceneNumbers,
    updateTitle,
    updateMetadata,
    undo,
    redo,
  } = useEditorStore();

  const { structureOpen, setStructureOpen } = useSettingsStore();

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [titlePageOpen, setTitlePageOpen] = useState(false);
  const [revisionMenuOpen, setRevisionMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const [aiStoryOpen, setAiStoryOpen] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [moodboardOpen, setMoodboardOpen] = useState(false);
  const [sprintTimerOpen, setSprintTimerOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);

  const title = currentScript?.title ?? "";
  const isRevisionMode = currentScript?.isRevisionMode || false;
  const currentDraft = currentScript?.revisionDraft || "White";
  const lockSceneNumbers = currentScript?.lockSceneNumbers || false;

  return (
    <>
      <header className="h-13 border-b border-border bg-surface px-4 py-2 flex items-center justify-between gap-4 select-none shrink-0">
        {/* Left: Back, Title & Title Page trigger */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <IconButton
            label="Back to library"
            onClick={onBack}
            className="text-text-muted hover:text-text"
          >
            <ChevronLeft className="w-5 h-5" />
          </IconButton>

          <input
            type="text"
            value={title}
            placeholder="Untitled screenplay"
            maxLength={200}
            aria-label="Script title"
            onChange={(e) => updateTitle(e.target.value)}
            className="text-sm font-semibold text-text bg-transparent hover:bg-surface-2 focus:bg-surface-2 border border-transparent hover:border-border/60 focus:border-border rounded px-2 py-1 outline-none truncate max-w-[220px] sm:max-w-xs transition-colors"
          />

          <IconButton
            label="Edit Title Page & Details"
            onClick={() => setTitlePageOpen(true)}
            className="text-text-muted hover:text-primary"
          >
            <BookOpen className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Center: View Switcher (Script vs Corkboard vs Breakdown) */}
        <div className="hidden lg:flex items-center rounded-btn bg-surface-2 p-0.5 border border-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode("script")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === "script"
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Script</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("corkboard")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === "corkboard"
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Corkboard</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("breakdown")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === "breakdown"
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Breakdown</span>
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Voice Dictation (Level 5) */}
          <DictationButton />

          {/* AI Story Studio (Level 3) */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAiStoryOpen(true)}
            className="text-xs hidden sm:flex items-center gap-1 text-primary border-primary/40 bg-primary/5 hover:bg-primary/10"
            title="AI Story Studio (Beat Sheets, Causality, Anti-AI-Slop Sparks)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio</span>
          </Button>

          {/* Scratch Pad / Bin (Level 2) */}
          <IconButton
            label="Scratch Pad & Bin"
            onClick={() => setScratchDrawerOpen(!isScratchDrawerOpen)}
            variant={isScratchDrawerOpen ? "primary" : "secondary"}
          >
            <Bookmark className="w-4 h-4" />
          </IconButton>

          {/* Named Snapshots (Level 1) */}
          <IconButton
            label="Named Revision Snapshots"
            onClick={() => setSnapshotsOpen(true)}
          >
            <History className="w-4 h-4" />
          </IconButton>

          {/* Writers Room (Level 4) */}
          <IconButton
            label="Live Writers Room"
            onClick={() => setCollabOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Users2 className="w-4 h-4" />
          </IconButton>

          {/* Creative Tools Dropdown (Moodboard, Sprints, Templates, Typewriter, Night Mode) */}
          <div className="relative">
            <IconButton
              label="Production & Creative Tools"
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              variant={toolsMenuOpen ? "primary" : "secondary"}
            >
              <Wrench className="w-4 h-4" />
            </IconButton>

            {toolsMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-border rounded-card shadow-lg p-1.5 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Creative & Production Tools
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMoodboardOpen(true);
                      setToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-text hover:bg-surface-2 transition-colors text-left"
                  >
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span>Visual Moodboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSprintTimerOpen(true);
                      setToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-text hover:bg-surface-2 transition-colors text-left"
                  >
                    <Timer className="w-3.5 h-3.5 text-primary" />
                    <span>Sprint Timer & Targets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplatesOpen(true);
                      setToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-text hover:bg-surface-2 transition-colors text-left"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Template Library</span>
                  </button>
                </div>

                <div className="h-px bg-border my-1" />
                <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Editor Modes
                </div>
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setTypewriterMode(!isTypewriterMode)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors text-left ${
                      isTypewriterMode ? "bg-primary/10 text-primary font-medium" : "text-text hover:bg-surface-2"
                    }`}
                  >
                    <span>Typewriter Lock (50%)</span>
                    <span className="text-[10px] uppercase font-mono">{isTypewriterMode ? "ON" : "OFF"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNightWarmMode(!isNightWarmMode)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors text-left ${
                      isNightWarmMode ? "bg-primary/10 text-primary font-medium" : "text-text hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Moon className="w-3 h-3 text-amber-500" />
                      <span>Warm Night Glow</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono">{isNightWarmMode ? "ON" : "OFF"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleLockSceneNumbers}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors text-left ${
                      lockSceneNumbers ? "bg-primary/10 text-primary font-medium" : "text-text hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3" />
                      <span>Lock Scene Numbers</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono">{lockSceneNumbers ? "LOCKED" : "FREE"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border mx-0.5" />

          <IconButton
            label="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 className="w-4 h-4" />
          </IconButton>

          <IconButton
            label="Redo (Ctrl+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 className="w-4 h-4" />
          </IconButton>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Revision Mode Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRevisionMenuOpen(!revisionMenuOpen)}
              className={`flex items-center gap-1 px-2 py-1 rounded-btn text-xs font-medium border transition-colors ${
                isRevisionMode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-muted hover:text-text bg-surface"
              }`}
              title="Revision Draft Mode"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentDraft} Draft</span>
            </button>

            {revisionMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-card shadow-md p-1.5 z-40 text-xs">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-text-muted uppercase">
                  <span>Revision Mode</span>
                  <input
                    type="checkbox"
                    checked={isRevisionMode}
                    onChange={(e) => {
                      updateMetadata({ isRevisionMode: e.target.checked });
                    }}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                <div className="h-px bg-border my-1" />
                <div className="space-y-0.5">
                  {REVISION_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        updateMetadata({ revisionDraft: color, isRevisionMode: true });
                        setRevisionMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded transition-colors ${
                        currentDraft === color
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-text hover:bg-surface-2"
                      }`}
                    >
                      {color} Draft
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <IconButton
            label="Focus / Zen Mode"
            onClick={() => setZenMode(true)}
          >
            <Maximize2 className="w-4 h-4" />
          </IconButton>

          <IconButton
            label="Toggle structure panel (Ctrl+0)"
            variant={structureOpen ? "primary" : "secondary"}
            onClick={() => setStructureOpen(!structureOpen)}
          >
            <Columns2 className="w-4 h-4" />
          </IconButton>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExportOpen(true)}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <IconButton
            label="Print / Save as PDF (Ctrl+P)"
            onClick={onPrintPreview}
          >
            <Printer className="w-4 h-4" />
          </IconButton>

          <IconButton
            label="Keyboard shortcuts (Ctrl+/)"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard className="w-4 h-4" />
          </IconButton>

          <IconButton
            label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </header>

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onExportClick={() => setExportOpen(true)}
      />
      <TitlePageDialog open={titlePageOpen} onOpenChange={setTitlePageOpen} />

      {/* Production Suite & Creative Modals */}
      <AIStoryModal open={aiStoryOpen} onOpenChange={setAiStoryOpen} />
      <SnapshotManagerDialog open={snapshotsOpen} onOpenChange={setSnapshotsOpen} />
      <MoodboardModal open={moodboardOpen} onOpenChange={setMoodboardOpen} />
      <SprintTimerModal open={sprintTimerOpen} onOpenChange={setSprintTimerOpen} />
      <TemplateLibraryModal open={templatesOpen} onOpenChange={setTemplatesOpen} />
      <CollabRoomModal open={collabOpen} onOpenChange={setCollabOpen} />

      {currentScript && (
        <ExportDialog
          open={exportOpen}
          script={currentScript}
          onOpenChange={setExportOpen}
          onPrintPreview={onPrintPreview}
        />
      )}
    </>
  );
}