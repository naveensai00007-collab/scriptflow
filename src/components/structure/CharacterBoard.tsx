import { useState } from "react";
import { useEditorStore } from "../../state/editorStore";
import { CharacterCard } from "./CharacterCard";
import { EmptyState } from "../ui/EmptyState";
import { Search, Users } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface CharacterBoardProps {
  onScrollToBlock: (blockId: string) => void;
}

export function CharacterBoard({ onScrollToBlock }: CharacterBoardProps) {
  const {
    currentScript,
    derivedCharacters,
    updateCharacterMetadata,
  } = useEditorStore();

  const [search, setSearch] = useState("");

  const characterMeta = currentScript?.characterMeta || {};

  const filtered = derivedCharacters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  if (derivedCharacters.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<Users className="w-8 h-8 stroke-[1.5]" />}
          title="No characters yet"
          description="Characters appear after you write dialogue in the script."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {derivedCharacters.length > 2 && (
        <div className="p-3 border-b border-border bg-surface shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <Input
              placeholder="Filter characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState
            title="No matching characters"
            description="No characters match your search."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                Clear
              </Button>
            }
          />
        ) : (
          filtered.map((character) => {
            const meta = characterMeta[character.id];
            return (
              <CharacterCard
                key={character.id}
                character={character}
                color={meta?.color || "none"}
                onNavigateToBlock={onScrollToBlock}
                onUpdateNote={(note) => updateCharacterMetadata(character.id, { note })}
                onUpdateColor={(color) => updateCharacterMetadata(character.id, { color })}
              />
            );
          })
        )}
      </div>
    </div>
  );
}