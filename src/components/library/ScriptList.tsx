import { useEffect, useState } from "react";
import { db } from "../../engine/storage/db";
import type { ScriptRecord } from "../../engine/types";
import { ScriptRow } from "./ScriptRow";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";
import { ImportButton } from "./ImportButton";
import { Plus, Search, FileText, AlertTriangle } from "lucide-react";
import { Input } from "../ui/Input";

interface ScriptListProps {
  onOpenScript: (id: string) => void;
  onCreateScript: () => Promise<void>;
  onImportSuccess: (id: string) => void;
}

export function ScriptList({
  onOpenScript,
  onCreateScript,
  onImportSuccess,
}: ScriptListProps) {
  const [scripts, setScripts] = useState<ScriptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadScripts = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await db.scripts.orderBy("updatedAt").reverse().toArray();
      setScripts(items);
    } catch (err: unknown) {
      setError("ScriptFlow can't access local storage on this device. Your work cannot be saved.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScripts();
  }, []);

  const handleDelete = async (id: string) => {
    await db.scripts.delete(id);
    setScripts((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = scripts.filter((s) =>
    (s.title || "Untitled script").toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-surface border border-border rounded-card space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-error/10 border border-error/20 rounded-card text-error flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Local storage unavailable</p>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={loadScripts}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (scripts.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-10 h-10 stroke-[1.5]" />}
        title="No scripts yet"
        description="Create your first script or import a Fountain/FDX file."
        action={
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={onCreateScript}>
              <Plus className="w-4 h-4 mr-1.5" />
              New script
            </Button>
            <ImportButton onImportSuccess={onImportSuccess} />
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {scripts.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching scripts"
          description="No scripts match your search term."
          action={
            <Button variant="secondary" size="sm" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((script) => (
            <ScriptRow
              key={script.id}
              script={script}
              onOpen={onOpenScript}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}