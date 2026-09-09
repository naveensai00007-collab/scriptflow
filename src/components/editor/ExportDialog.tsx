import { useState } from "react";
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
import type { ScriptRecord } from "../../engine/types";
import { exportFountain } from "../../engine/export/fountain";
import { exportFDX } from "../../engine/export/fdx";
import { slugify } from "../../lib/slug";
import { useToast } from "../ui/Toast";
import { useEditorStore } from "../../state/editorStore";
import { FileText, FileCode2, Printer, Shield } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  script: ScriptRecord;
  onOpenChange: (open: boolean) => void;
  onPrintPreview: () => void;
}

type ExportFormat = "fountain" | "fdx" | "pdf";

export function ExportDialog({
  open,
  script,
  onOpenChange,
  onPrintPreview,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("fountain");
  const [watermark, setWatermark] = useState(script.watermarkText || "");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { updateMetadata } = useEditorStore();

  const baseFilename = slugify(script.title || "untitled-script");

  const handleExport = async () => {
    if (selectedFormat === "pdf") {
      updateMetadata({ watermarkText: watermark.trim() });
      onOpenChange(false);
      onPrintPreview();
      return;
    }

    setLoading(true);
    try {
      let content = "";
      let mimeType = "";
      let filename = "";

      if (selectedFormat === "fountain") {
        content = exportFountain(script);
        mimeType = "text/plain;charset=utf-8";
        filename = `${baseFilename}.fountain`;
      } else if (selectedFormat === "fdx") {
        content = exportFDX(script);
        mimeType = "application/xml;charset=utf-8";
        filename = `${baseFilename}.fdx`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      showToast(`Downloaded ${filename}.`, "success");
      onOpenChange(false);
    } catch {
      showToast("Export failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export script</DialogTitle>
          <DialogDescription>
            Choose your preferred screenplay interchange or print format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div
            onClick={() => setSelectedFormat("fountain")}
            className={`flex items-start gap-3 p-3.5 rounded-card border cursor-pointer transition-colors ${
              selectedFormat === "fountain"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <p className="text-sm font-medium text-text">Fountain (.fountain)</p>
              <p className="text-xs text-text-muted">
                Universal plain text screenplay format compatible with Highland, WriterDuet, and Scrivener.
              </p>
            </div>
          </div>

          <div
            onClick={() => setSelectedFormat("fdx")}
            className={`flex items-start gap-3 p-3.5 rounded-card border cursor-pointer transition-colors ${
              selectedFormat === "fdx"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            <FileCode2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <p className="text-sm font-medium text-text">Final Draft XML (.fdx)</p>
              <p className="text-xs text-text-muted">
                Industry standard Final Draft XML format with scene, character, and dialogue mapping.
              </p>
            </div>
          </div>

          <div
            onClick={() => setSelectedFormat("pdf")}
            className={`flex items-start gap-3 p-3.5 rounded-card border cursor-pointer transition-colors ${
              selectedFormat === "pdf"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            <Printer className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-left">
              <p className="text-sm font-medium text-text">Print-ready PDF</p>
              <p className="text-xs text-text-muted">
                Industry standard 12pt Courier Prime layout with standard US Letter screenplay margins.
              </p>
            </div>
          </div>

          {/* Watermark option if PDF selected */}
          {selectedFormat === "pdf" && (
            <div className="pt-2 border-t border-border/60 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Security Watermark (Optional)</span>
              </div>
              <Input
                value={watermark}
                placeholder="e.g. CONFIDENTIAL - FOR ACTOR / PRODUCER"
                maxLength={80}
                onChange={(e) => setWatermark(e.target.value)}
                className="h-8 text-xs font-mono uppercase"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleExport}>
            {selectedFormat === "pdf" ? "Open Print Preview" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}