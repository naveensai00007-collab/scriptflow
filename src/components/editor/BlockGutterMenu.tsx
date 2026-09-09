import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { BlockType } from "../../engine/types";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface BlockGutterMenuProps {
  currentType: BlockType;
  onTypeChange: (type: BlockType) => void;
  onDelete: () => void;
}

const TYPE_OPTIONS: { type: BlockType; label: string; shortcut: string }[] = [
  { type: "scene_heading", label: "Scene Heading", shortcut: "Alt+1" },
  { type: "action", label: "Action", shortcut: "Alt+2" },
  { type: "character", label: "Character", shortcut: "Alt+3" },
  { type: "dialogue", label: "Dialogue", shortcut: "Alt+4" },
  { type: "parenthetical", label: "Parenthetical", shortcut: "Alt+5" },
  { type: "transition", label: "Transition", shortcut: "Alt+6" },
  { type: "note", label: "Note", shortcut: "Alt+7" },
];

export function BlockGutterMenu({
  currentType,
  onTypeChange,
  onDelete,
}: BlockGutterMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Block options"
          className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors outline-none opacity-40 hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[170px] bg-surface border border-border rounded-card p-1 shadow-md text-xs outline-none"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Change Element
          </div>
          {TYPE_OPTIONS.map((opt) => (
            <DropdownMenuPrimitive.Item
              key={opt.type}
              onClick={() => onTypeChange(opt.type)}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer outline-none transition-colors ${
                currentType === opt.type
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text hover:bg-surface-2"
              }`}
            >
              <span>{opt.label}</span>
              <span className="text-[10px] text-text-muted font-mono">{opt.shortcut}</span>
            </DropdownMenuPrimitive.Item>
          ))}

          <DropdownMenuPrimitive.Separator className="h-px bg-border my-1" />

          <DropdownMenuPrimitive.Item
            onClick={onDelete}
            className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer outline-none text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete element</span>
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}