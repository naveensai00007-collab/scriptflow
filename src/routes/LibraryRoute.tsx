import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScriptList } from "../components/library/ScriptList";
import { Button } from "../components/ui/Button";
import { ImportButton } from "../components/library/ImportButton";
import { IconButton } from "../components/ui/IconButton";
import { SettingsDialog } from "../components/editor/SettingsDialog";
import { useEditorStore } from "../state/editorStore";
import { useSettingsStore } from "../state/settingsStore";
import { Plus, Settings, Sun, Moon, Feather } from "lucide-react";

export function LibraryRoute() {
  const navigate = useNavigate();
  const { createNewScript } = useEditorStore();
  const { theme, setTheme } = useSettingsStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateScript = async () => {
    setCreating(true);
    try {
      const newId = await createNewScript("Untitled script");
      if (newId) {
        navigate(`/editor/${newId}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleOpenScript = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-surface/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-btn bg-primary flex items-center justify-center text-white shadow-sm">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-text">
              ScriptFlow
            </h1>
            <p className="text-[10px] text-text-muted hidden sm:block">
              Offline Screenplay Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ImportButton onImportSuccess={handleOpenScript} />

          <Button
            variant="primary"
            loading={creating}
            onClick={handleCreateScript}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New script
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <IconButton
            label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={handleToggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-text-muted" />
            )}
          </IconButton>

          <IconButton
            label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 text-text-muted" />
          </IconButton>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text tracking-tight">Scripts</h2>
            <p className="text-xs text-text-muted mt-1">
              Your screenplays are saved locally on this device.
            </p>
          </div>
        </div>

        <ScriptList
          onOpenScript={handleOpenScript}
          onCreateScript={handleCreateScript}
          onImportSuccess={handleOpenScript}
        />
      </main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}