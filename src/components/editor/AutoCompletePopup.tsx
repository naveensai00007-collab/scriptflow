import { useEffect, useState } from "react";

interface AutoCompletePopupProps {
  query: string;
  type: "scene_heading" | "character";
  existingLocations: string[];
  existingCharacters: string[];
  onSelect: (value: string) => void;
  onDismiss: () => void;
}

const COMMON_PREFIXES = ["INT. ", "EXT. ", "INT./EXT. ", "I/E "];
const COMMON_TIMES = ["- DAY", "- NIGHT", "- CONTINUOUS", "- LATER", "- DUSK", "- DAWN", "- MOMENTS LATER"];

export function AutoCompletePopup({
  query,
  type,
  existingLocations,
  existingCharacters,
  onSelect,
  onDismiss,
}: AutoCompletePopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Compute suggestions based on context
  let suggestions: string[] = [];

  if (type === "scene_heading") {
    const upper = query.toUpperCase();

    // 1. Time tags (if contains hyphen)
    if (upper.includes("-")) {
      const parts = upper.split("-");
      const afterHyphen = parts[parts.length - 1].trim();
      suggestions = COMMON_TIMES.filter((t) =>
        t.toLowerCase().includes(afterHyphen.toLowerCase())
      );
    }
    // 2. Prefix suggestions
    else if (!upper.startsWith("INT.") && !upper.startsWith("EXT.") && !upper.startsWith("I/E")) {
      suggestions = COMMON_PREFIXES.filter((p) =>
        p.toLowerCase().startsWith(query.toLowerCase())
      );
    }
    // 3. Location suggestions
    else {
      const match = upper.match(/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E)\s*(.*)$/);
      if (match) {
        const prefix = match[1];
        const typedLoc = match[2].trim();
        suggestions = existingLocations
          .filter((loc) => loc.toLowerCase().includes(typedLoc.toLowerCase()) && loc.toUpperCase() !== typedLoc)
          .map((loc) => `${prefix} ${loc} - `);
      }
    }
  } else if (type === "character") {
    const upper = query.trim().toUpperCase();
    if (upper) {
      suggestions = existingCharacters.filter((c) =>
        c.toUpperCase().startsWith(upper) && c.toUpperCase() !== upper
      );
    }
  }

  // Cap suggestions at 6
  suggestions = suggestions.slice(0, 6);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          onSelect(suggestions[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [suggestions, selectedIndex, onSelect, onDismiss]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 top-full mt-1 z-30 min-w-[200px] bg-surface border border-border rounded-card shadow-md p-1 text-xs">
      <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        Suggestions (Tab to insert)
      </div>
      {suggestions.map((item, idx) => (
        <button
          key={item}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item);
          }}
          className={`w-full text-left px-2.5 py-1.5 rounded font-mono transition-colors ${
            idx === selectedIndex
              ? "bg-primary text-white font-medium"
              : "text-text hover:bg-surface-2"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}