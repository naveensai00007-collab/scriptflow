import { useCallback, useMemo, useEffect, useRef } from "react";
import type { ScriptBlock, BlockType } from "../../engine/types";
import { Block } from "./Block";
import { useEditorStore } from "../../state/editorStore";
import { useSettingsStore } from "../../state/settingsStore";
import { cn } from "../../lib/utils";

interface BlockEditorProps {
  blocks: ScriptBlock[];
}

export function BlockEditor({ blocks }: BlockEditorProps) {
  const {
    activeBlockId,
    activeCaretPos,
    pagination,
    derivedScenes,
    derivedCharacters,
    isTypewriterMode,
    isNightWarmMode,
    updateBlock,
    setBlockType,
    cycleBlockTypeAt,
    toggleDualDialogueAt,
    splitBlockAt,
    mergeBlockAt,
    removeBlock,
    setActiveBlock,
  } = useEditorStore();

  const { fontSize } = useSettingsStore();
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Typewriter Mode: Keep active caret line vertically centered (50% viewport lock)
  useEffect(() => {
    if (isTypewriterMode && activeBlockId) {
      const el = document.getElementById(`block-${activeBlockId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isTypewriterMode, activeBlockId]);

  const handleNavigate = useCallback(
    (currentIndex: number, direction: "prev" | "next") => {
      const targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex >= 0 && targetIndex < blocks.length) {
        const targetBlock = blocks[targetIndex];
        const caretPos = direction === "prev" ? targetBlock.text.length : 0;
        setActiveBlock(targetBlock.id, caretPos);
      }
    },
    [blocks, setActiveBlock]
  );

  // Map derived scenes to block ID for scene numbers
  const sceneNumberMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const scene of derivedScenes) {
      if (scene.id && scene.number > 0) {
        map[scene.id] = scene.customNumber || String(scene.number);
      }
    }
    return map;
  }, [derivedScenes]);

  // Extract unique previous locations from scene headings for autocomplete
  const existingLocations = useMemo(() => {
    const locs = new Set<string>();
    for (const b of blocks) {
      if (b.type === "scene_heading") {
        const cleaned = b.text.replace(/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E)\s*/i, "").split("-")[0]?.trim();
        if (cleaned) locs.add(cleaned.toUpperCase());
      }
    }
    return Array.from(locs);
  }, [blocks]);

  const existingCharacters = useMemo(() => {
    return derivedCharacters.map((c) => c.name);
  }, [derivedCharacters]);

  return (
    <div
      ref={editorContainerRef}
      className={cn(
        "flex-1 overflow-y-auto px-4 py-8 flex justify-center transition-colors duration-300 select-text",
        isNightWarmMode ? "bg-[#110F0D]" : "bg-bg"
      )}
    >
      <div
        className={cn(
          "w-full max-w-[820px] min-h-[90vh] rounded-card border shadow-sm px-10 sm:px-16 py-12 flex flex-col relative transition-colors duration-300",
          isNightWarmMode
            ? "bg-[#191613] border-amber-900/30 text-[#FAF6ED]"
            : "bg-surface border-border/80"
        )}
      >
        {/* Page 1 Header */}
        <div className="flex justify-end text-[11px] font-mono text-text-muted select-none pb-6 border-b border-border/40 mb-4">
          <span>1.</span>
        </div>

        {blocks.map((block, index) => {
          const hasPageBreakAfter = pagination.pageBreakAfterBlocks.has(block.id);
          const pageNumber = (pagination.blockPageMap[block.id] || 1) + 1;

          return (
            <div key={block.id} className="w-full">
              <Block
                block={block}
                isActive={activeBlockId === block.id}
                caretPosToSet={activeBlockId === block.id ? activeCaretPos : undefined}
                placeholder={
                  index === 0 && blocks.length === 1 && block.text === ""
                    ? "INT. COFFEE SHOP - DAY"
                    : undefined
                }
                fontSize={fontSize}
                existingLocations={existingLocations}
                existingCharacters={existingCharacters}
                sceneNumber={sceneNumberMap[block.id] || block.sceneNumber}
                onUpdateText={(text) => updateBlock(block.id, text)}
                onChangeType={(type: BlockType) => setBlockType(block.id, type)}
                onCycleType={(dir) => cycleBlockTypeAt(block.id, dir)}
                onToggleDualDialogue={() => toggleDualDialogueAt(block.id)}
                onSplit={(caretPos) => splitBlockAt(block.id, caretPos)}
                onMerge={() => mergeBlockAt(block.id)}
                onDelete={() => removeBlock(block.id)}
                onFocus={(caretPos) => setActiveBlock(block.id, caretPos)}
                onNavigatePrev={() => handleNavigate(index, "prev")}
                onNavigateNext={() => handleNavigate(index, "next")}
              />

              {/* Dynamic Page Break Divider */}
              {hasPageBreakAfter && (
                <div className="my-8 py-3 flex items-center justify-between text-xs font-mono text-text-muted border-y border-dashed border-border/80 select-none bg-surface-2/40 px-3 rounded">
                  <span>── PAGE BREAK ──</span>
                  <span>{pageNumber}.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}