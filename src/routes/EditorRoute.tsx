import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditorStore } from "../state/editorStore";
import { useSettingsStore } from "../state/settingsStore";
import { EditorTopBar } from "../components/editor/EditorTopBar";
import { BlockEditor } from "../components/editor/BlockEditor";
import { CorkboardView } from "../components/structure/CorkboardView";
import { StructurePanel } from "../components/structure/StructurePanel";
import { BreakdownView } from "../components/production/BreakdownView";
import { ScratchPadDrawer } from "../components/editor/ScratchPadDrawer";
import { EditorStatusBar } from "../components/editor/EditorStatusBar";
import { HintBar } from "../components/editor/HintBar";
import { FocusModeOverlay } from "../components/editor/FocusModeOverlay";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function EditorRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    currentScript,
    saveStatus,
    activeBlockId,
    viewMode,
    setViewMode,
    loadScript,
    saveNow,
    undo,
    redo,
    setZenMode,
    isZenMode,
    recoveredChanges,
    dismissRecoveryNotice,
    isStorageError,
    storageErrorMessage,
  } = useEditorStore();

  const {
    structureOpen,
    setStructureOpen,
    setActiveStructureTab,
  } = useSettingsStore();

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    loadScript(id).then((found) => {
      if (!found) {
        showToast("That script could not be found.", "error");
        navigate("/");
      }
    });
  }, [id, loadScript, navigate, showToast]);

  const scrollToBlock = useCallback((blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const textarea = el.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "F11" || (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "f")) {
        e.preventDefault();
        setZenMode(!isZenMode);
        return;
      }

      if (isCmdOrCtrl) {
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          saveNow();
          return;
        }
        if (e.key === "0") {
          e.preventDefault();
          setStructureOpen(!structureOpen);
          return;
        }
        if (e.key === "1") {
          e.preventDefault();
          setStructureOpen(false);
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          setStructureOpen(true);
          setActiveStructureTab("beats");
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          setStructureOpen(true);
          setActiveStructureTab("characters");
          return;
        }
        if (e.key.toLowerCase() === "z") {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveNow, structureOpen, setStructureOpen, setActiveStructureTab, undo, redo, isZenMode, setZenMode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  if (!currentScript) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <header className="h-13 border-b border-border bg-surface px-4 py-2 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </header>
        <div className="flex-1 flex justify-center p-8">
          <div className="w-full max-w-[800px] h-[80vh] bg-surface rounded-card border border-border p-12 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const activeBlock = currentScript.blocks.find((b) => b.id === activeBlockId);
  const sceneCount = currentScript.blocks.filter((b) => b.type === "scene_heading").length;
  const wordCount = currentScript.blocks.reduce((acc, b) => {
    return acc + b.text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col h-screen overflow-hidden">
      <EditorTopBar
        onBack={() => navigate("/")}
        onPrintPreview={() => navigate(`/print/${currentScript.id}`)}
      />

      {recoveredChanges && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Recovered unsaved changes from your last session.</span>
          </div>
          <button
            onClick={dismissRecoveryNotice}
            className="text-emerald-700 dark:text-emerald-300 hover:underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {isStorageError && (
        <div className="bg-error/10 border-b border-error/20 text-error px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {storageErrorMessage || "Local storage failed. Your changes may not be saved."}
            </span>
          </div>
          <button
            onClick={saveNow}
            className="underline font-semibold hover:text-error/80"
          >
            Retry save
          </button>
        </div>
      )}

      <HintBar />

      {/* Main Workspace (Script View vs Corkboard View vs Breakdown View) */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === "corkboard" ? (
          <CorkboardView onSelectScene={scrollToBlock} />
        ) : viewMode === "breakdown" ? (
          <BreakdownView onBackToScript={() => setViewMode("script")} />
        ) : (
          <>
            <BlockEditor blocks={currentScript.blocks} />
            <StructurePanel onScrollToBlock={scrollToBlock} />
          </>
        )}
      </div>

      <EditorStatusBar
        sceneCount={sceneCount}
        wordCount={wordCount}
        currentBlockType={activeBlock?.type || null}
        saveStatus={saveStatus}
        onRetrySave={saveNow}
      />

      <ScratchPadDrawer />
      <FocusModeOverlay />
    </div>
  );
}