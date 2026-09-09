import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useEditorStore } from "../../state/editorStore";
import { BookOpen } from "lucide-react";

interface TitlePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TitlePageDialog({ open, onOpenChange }: TitlePageDialogProps) {
  const { currentScript, updateTitle, updateMetadata } = useEditorStore();

  const [title, setTitle] = useState("");
  const [writtenBy, setWrittenBy] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [logline, setLogline] = useState("");

  useEffect(() => {
    if (currentScript) {
      setTitle(currentScript.title || "");
      setWrittenBy(currentScript.writtenBy || "");
      setContactInfo(currentScript.contactInfo || "");
      setLogline(currentScript.logline || "");
    }
  }, [currentScript, open]);

  const handleSave = () => {
    updateTitle(title.trim());
    updateMetadata({
      writtenBy: writtenBy.trim(),
      contactInfo: contactInfo.trim(),
      logline: logline.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-btn bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Title Page & Project Details</DialogTitle>
              <DialogDescription>
                Industry standard screenplay title page metadata.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">
              Film / Project Title
            </label>
            <Input
              value={title}
              maxLength={200}
              placeholder="e.g. INCEPTION, CHINATOWN"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">
              Written By (Author)
            </label>
            <Input
              value={writtenBy}
              maxLength={200}
              placeholder="e.g. Jane Doe"
              onChange={(e) => setWrittenBy(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">
              Logline
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={logline}
              placeholder="A one or two sentence summary of your story's central dramatic conflict..."
              onChange={(e) => setLogline(e.target.value)}
              className="w-full text-xs p-2.5 bg-surface border border-border rounded-input text-text outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">
              Contact Details / Rights Information
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={contactInfo}
              placeholder="Agent, manager, email, or copyright registration info..."
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full text-xs p-2.5 bg-surface border border-border rounded-input text-text outline-none focus:border-focus focus:ring-2 focus:ring-focus/20 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}