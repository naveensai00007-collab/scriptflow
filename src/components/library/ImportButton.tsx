import { useRef, useState } from "react";
import { Import as ImportIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { parseFountain } from "../../engine/parse/fountain";
import { parseFDX } from "../../engine/parse/fdx";
import { useEditorStore } from "../../state/editorStore";
import { useToast } from "../ui/Toast";

interface ImportButtonProps {
  onImportSuccess: (scriptId: string) => void;
}

export function ImportButton({ onImportSuccess }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { createNewScript } = useEditorStore();
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (file.size > 5 * 1024 * 1024) {
      showToast("File exceeds 5MB limit. Please select a smaller file.", "error");
      return;
    }

    const name = file.name.toLowerCase();
    const isFountain = name.endsWith(".fountain") || name.endsWith(".txt");
    const isFdx = name.endsWith(".fdx");

    if (!isFountain && !isFdx) {
      showToast(
        "That file could not be read as a screenplay. Supported formats: Fountain (.fountain, .txt) and Final Draft XML (.fdx).",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      let parseResult;

      if (isFdx) {
        parseResult = parseFDX(text);
      } else {
        parseResult = parseFountain(text);
      }

      if (!parseResult.ok) {
        showToast(parseResult.error, "error");
        return;
      }

      const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
      const finalTitle = parseResult.value.title !== "Untitled script" ? parseResult.value.title : defaultTitle;

      const newId = await createNewScript(finalTitle, parseResult.value.blocks);
      if (newId) {
        showToast(`Imported "${finalTitle}" successfully.`, "success");
        onImportSuccess(newId);
      } else {
        showToast("Couldn't save imported script. Try again.", "error");
      }
    } catch (err: unknown) {
      showToast("Failed to read file.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".fountain,.txt,.fdx"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="secondary"
        loading={loading}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImportIcon className="w-4 h-4 mr-1.5" />
        Import
      </Button>
    </>
  );
}