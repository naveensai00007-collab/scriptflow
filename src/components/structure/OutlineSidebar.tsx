import { useState } from "react";
import { useEditorStore } from "../../state/editorStore";
import { Search } from "lucide-react";
import { Input } from "../ui/Input";

interface OutlineSidebarProps {
  onScrollToBlock: (blockId: string) => void;
}

export function OutlineSidebar({ onScrollToBlock }: OutlineSidebarProps) {
  const { derivedScenes } = useEditorStore();
  const [search, setSearch] = useState("");

  const filtered = derivedScenes.filter((s) =>
    s.heading.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col h-full text-xs">
      <div className="p-3 border-b border-border bg-surface shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
          <Input
            placeholder="Search outline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {filtered.map((scene) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => onScrollToBlock(scene.startBlockId)}
            className="w-full text-left p-2.5 hover:bg-surface-2 transition-colors flex items-start justify-between gap-2 group"
          >
            <div className="min-w-0">
              <span className="font-mono text-[10px] text-text-muted block font-semibold">
                {scene.isPrologue ? "PROLOGUE" : `SCENE ${scene.number}`}
              </span>
              <p className="font-mono text-xs text-text truncate group-hover:text-primary transition-colors">
                {scene.heading}
              </p>
            </div>
            <span className="font-mono text-[11px] text-text-muted shrink-0 pt-0.5">
              p. {scene.pageNumber || 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}