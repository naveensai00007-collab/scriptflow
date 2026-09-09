import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { BeatBoard } from "./BeatBoard";
import { CharacterBoard } from "./CharacterBoard";
import { OutlineSidebar } from "./OutlineSidebar";
import { CharacterBenchModal } from "./CharacterBenchModal";
import { useSettingsStore } from "../../state/settingsStore";
import { X, Users } from "lucide-react";
import { Button } from "../ui/Button";

interface StructurePanelProps {
  onScrollToBlock: (blockId: string) => void;
}

export function StructurePanel({ onScrollToBlock }: StructurePanelProps) {
  const {
    structureOpen,
    activeStructureTab,
    setStructureOpen,
    setActiveStructureTab,
  } = useSettingsStore();

  const [benchOpen, setBenchOpen] = useState(false);

  if (!structureOpen) return null;

  return (
    <>
      <aside className="w-full lg:w-[360px] border-l border-border bg-surface flex flex-col h-full shrink-0 shadow-sm">
        <Tabs
          value={activeStructureTab}
          onValueChange={(val) => setActiveStructureTab(val as "beats" | "characters" | "outline")}
          className="flex flex-col h-full"
        >
          <div className="h-13 px-4 border-b border-border flex items-center justify-between shrink-0">
            <TabsList>
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="beats">Beats</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-1">
              {activeStructureTab === "characters" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBenchOpen(true)}
                  title="Open Character Bench"
                  className="h-7 text-xs px-2"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Bench
                </Button>
              )}
              <button
                type="button"
                onClick={() => setStructureOpen(false)}
                aria-label="Close structure panel"
                className="p-1 rounded-sm text-text-muted hover:text-text hover:bg-surface-2 lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <TabsContent value="outline" className="flex-1 overflow-hidden mt-0">
            <OutlineSidebar onScrollToBlock={onScrollToBlock} />
          </TabsContent>

          <TabsContent value="beats" className="flex-1 overflow-hidden mt-0">
            <BeatBoard onScrollToBlock={onScrollToBlock} />
          </TabsContent>

          <TabsContent value="characters" className="flex-1 overflow-hidden mt-0">
            <CharacterBoard onScrollToBlock={onScrollToBlock} />
          </TabsContent>
        </Tabs>
      </aside>

      <CharacterBenchModal open={benchOpen} onOpenChange={setBenchOpen} />
    </>
  );
}