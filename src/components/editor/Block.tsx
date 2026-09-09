import { useRef, useEffect, useCallback, useState } from "react";
import type { ScriptBlock, BlockType } from "../../engine/types";
import { BlockGutterMenu } from "./BlockGutterMenu";
import { AutoCompletePopup } from "./AutoCompletePopup";
import { cn } from "../../lib/utils";
import { Columns2 } from "lucide-react";

interface BlockProps {
  block: ScriptBlock;
  isActive: boolean;
  caretPosToSet?: number;
  placeholder?: string;
  fontSize: number;
  existingLocations?: string[];
  existingCharacters?: string[];
  sceneNumber?: string;
  onUpdateText: (text: string) => void;
  onChangeType: (type: BlockType) => void;
  onCycleType: (direction: "forward" | "backward") => void;
  onToggleDualDialogue: () => void;
  onSplit: (caretPos: number) => void;
  onMerge: () => void;
  onDelete: () => void;
  onFocus: (caretPos: number) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

export function Block({
  block,
  isActive,
  caretPosToSet,
  placeholder,
  fontSize,
  existingLocations = [],
  existingCharacters = [],
  sceneNumber,
  onUpdateText,
  onChangeType,
  onCycleType,
  onToggleDualDialogue,
  onSplit,
  onMerge,
  onDelete,
  onFocus,
  onNavigatePrev,
  onNavigateNext,
}: BlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAutoComplete, setShowAutoComplete] = useState(true);

  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [block.text, fontSize, autoResize]);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
      if (caretPosToSet !== undefined) {
        const pos = Math.min(caretPosToSet, textareaRef.current.value.length);
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }
  }, [isActive, caretPosToSet]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Tab key cycling (Action -> Character -> Parenthetical -> Dialogue -> Transition -> Scene Heading)
    if (e.key === "Tab") {
      e.preventDefault();
      onCycleType(e.shiftKey ? "backward" : "forward");
      return;
    }

    // Smart Parenthetical: Typing "(" on Dialogue or Character
    if (e.key === "(" && (block.type === "character" || block.type === "dialogue")) {
      if (textarea.selectionStart === 0 && textarea.selectionEnd === 0 && block.text.trim() === "") {
        e.preventDefault();
        onChangeType("parenthetical");
        onUpdateText("()");
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(1, 1);
          }
        }, 10);
        return;
      }
    }

    // Alt + 1..7 for changing block types
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const keyMap: Record<string, BlockType> = {
        "1": "scene_heading",
        "2": "action",
        "3": "character",
        "4": "dialogue",
        "5": "parenthetical",
        "6": "transition",
        "7": "note",
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        onChangeType(keyMap[e.key]);
        return;
      }
    }

    // Enter key handling
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      onSplit(textarea.selectionStart);
      return;
    }

    // Backspace handling at start (0)
    if (e.key === "Backspace" && textarea.selectionStart === 0 && textarea.selectionEnd === 0) {
      e.preventDefault();
      onMerge();
      return;
    }

    // Navigation with Arrow keys at boundaries
    if (e.key === "ArrowUp" && textarea.selectionStart === 0) {
      e.preventDefault();
      onNavigatePrev();
      return;
    }

    if (e.key === "ArrowDown" && textarea.selectionStart === textarea.value.length) {
      e.preventDefault();
      onNavigateNext();
      return;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;

    // Auto-capitalization for Scene Heading, Character, Transition
    if (block.type === "scene_heading" || block.type === "character" || block.type === "transition") {
      val = val.toUpperCase();
    }

    onUpdateText(val);
    setShowAutoComplete(true);
    autoResize();
  };

  const getBlockStyle = () => {
    switch (block.type) {
      case "scene_heading":
        return "uppercase font-semibold tracking-wide text-text mt-6 mb-3 text-left w-full";
      case "action":
        return "text-text my-2 w-full text-left";
      case "character":
        return block.isDualDialogue
          ? "uppercase font-medium text-text mt-3 mb-0 text-center w-full"
          : "uppercase font-medium text-text mt-3 mb-0 ml-[35%] w-[65%] text-left";
      case "dialogue":
        return block.isDualDialogue
          ? "text-text mt-0 mb-2 w-full text-center leading-[1.55]"
          : "text-text mt-0 mb-2 ml-[22%] max-w-[36ch] leading-[1.55] text-left";
      case "parenthetical":
        return block.isDualDialogue
          ? "text-text mt-0 mb-0 w-full text-center italic"
          : "text-text mt-0 mb-0 ml-[26%] max-w-[30ch] italic text-left";
      case "transition":
        return "uppercase font-semibold text-text my-3 text-right w-full";
      case "note":
        return "my-2 p-2 bg-surface-2/70 border-l-2 border-primary/50 text-text-muted text-xs italic rounded-r";
      default:
        return "my-2 text-text w-full";
    }
  };

  return (
    <div
      id={`block-${block.id}`}
      className={cn(
        "group relative flex items-start w-full transition-colors duration-100",
        block.isDualDialogue && "w-1/2 px-3 border-l border-border/50"
      )}
    >
      {/* Gutter menu trigger & Dual Dialogue toggle */}
      <div className="absolute -left-10 top-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5">
        <BlockGutterMenu
          currentType={block.type}
          onTypeChange={onChangeType}
          onDelete={onDelete}
        />
        {(block.type === "character" || block.type === "dialogue") && (
          <button
            type="button"
            title={block.isDualDialogue ? "Disable Dual Dialogue" : "Make Dual Dialogue"}
            onClick={onToggleDualDialogue}
            className={cn(
              "p-0.5 rounded text-text-muted hover:text-primary transition-colors",
              block.isDualDialogue && "text-primary bg-primary/10"
            )}
          >
            <Columns2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={block.text}
        rows={1}
        placeholder={placeholder}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => onFocus(e.target.selectionStart)}
        style={{ fontSize: `${fontSize}px` }}
        className={cn(
          "font-mono resize-none overflow-hidden bg-transparent border-none outline-none leading-[1.55] select-text transition-colors",
          getBlockStyle()
        )}
      />

      {/* Autocomplete Popup */}
      {isActive && showAutoComplete && (block.type === "scene_heading" || block.type === "character") && (
        <AutoCompletePopup
          query={block.text}
          type={block.type}
          existingLocations={existingLocations}
          existingCharacters={existingCharacters}
          onSelect={(val) => {
            onUpdateText(val);
            setShowAutoComplete(false);
          }}
          onDismiss={() => setShowAutoComplete(false)}
        />
      )}

      {/* Scene Numbering (Industry Standard: displayed on left and right margins of Scene Headings) */}
      {block.type === "scene_heading" && sceneNumber && (
        <>
          <span className="absolute -left-10 top-3 text-[11px] font-mono font-bold text-text-muted select-none">
            {sceneNumber}
          </span>
          <span className="absolute -right-10 top-3 text-[11px] font-mono font-bold text-text-muted select-none">
            {sceneNumber}
          </span>
        </>
      )}

      {/* Revision Asterisk in right margin */}
      {block.isRevised && (
        <div
          title={`Revised in ${block.revisionDraft || "Draft"}`}
          className="absolute -right-6 top-1 text-primary font-bold font-mono text-sm select-none"
        >
          *
        </div>
      )}
    </div>
  );
}