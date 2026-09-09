import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { CalendarDays, Plus, Printer, Trash2, Clock, MapPin } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import { createDefaultCallSheet } from "../../engine/production/breakdown";
import type { CallSheet } from "../../engine/types";
import { useToast } from "../ui/Toast";

interface CallSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallSheetModal({ open, onOpenChange }: CallSheetModalProps) {
  const { currentScript, derivedScenes, derivedCharacters, saveCallSheet, deleteCallSheet } =
    useEditorStore();
  const { showToast } = useToast();

  const callSheets = currentScript?.callSheets || [];
  const [activeSheet, setActiveSheet] = useState<CallSheet | null>(null);

  useEffect(() => {
    if (callSheets.length > 0) {
      setActiveSheet(callSheets[0]);
    } else if (open) {
      const defaultScenes = derivedScenes.slice(0, 3).map((s) => s.heading);
      const defaultCast = derivedCharacters.slice(0, 3).map((c) => c.name);
      const newSheet = createDefaultCallSheet(
        1,
        "Stage A / Principal Location",
        defaultScenes.length > 0 ? defaultScenes : ["INT. OFFICE - DAY"],
        defaultCast.length > 0 ? defaultCast : ["PROTAGONIST", "SUPPORTING"]
      );
      setActiveSheet(newSheet);
    }
  }, [open, callSheets, derivedScenes, derivedCharacters]);

  if (!activeSheet) return null;

  const handleCreateNew = () => {
    const nextDay = (callSheets.length || 0) + 1;
    const defaultScenes = derivedScenes.slice(0, 3).map((s) => s.heading);
    const defaultCast = derivedCharacters.slice(0, 3).map((c) => c.name);
    const newSheet = createDefaultCallSheet(
      nextDay,
      "Location Beta",
      defaultScenes.length > 0 ? defaultScenes : ["EXT. STREET - NIGHT"],
      defaultCast.length > 0 ? defaultCast : ["PROTAGONIST"]
    );
    saveCallSheet(newSheet);
    setActiveSheet(newSheet);
    showToast(`Created Day ${nextDay} Call Sheet`, "success");
  };

  const handleSave = () => {
    if (!activeSheet) return;
    saveCallSheet(activeSheet);
    showToast("Saved Call Sheet", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-sans">
                  Daily Production Call Sheet
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted">
                  Standard industry daily schedule for cast, crew, and shooting locations
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleCreateNew} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Day</span>
              </Button>
              <Button size="sm" variant="secondary" onClick={handlePrint} className="text-xs">
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Shoot Day Selector Tabs */}
        {callSheets.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b border-border">
            {callSheets.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => setActiveSheet(sheet)}
                className={`px-3 py-1 rounded text-xs font-semibold shrink-0 transition-colors ${
                  activeSheet.id === sheet.id
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-text-muted hover:text-text border border-border"
                }`}
              >
                Day {sheet.shootDay} ({sheet.date})
              </button>
            ))}
          </div>
        )}

        {/* Call Sheet Form Body */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 text-xs">
          {/* Key Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-2/50 p-3.5 rounded-card border border-border">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Shoot Day
              </label>
              <input
                type="number"
                value={activeSheet.shootDay}
                onChange={(e) =>
                  setActiveSheet({ ...activeSheet, shootDay: parseInt(e.target.value) || 1 })
                }
                className="w-full px-2.5 py-1 bg-surface border border-border rounded text-text font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Shoot Date
              </label>
              <input
                type="date"
                value={activeSheet.date}
                onChange={(e) => setActiveSheet({ ...activeSheet, date: e.target.value })}
                className="w-full px-2.5 py-1 bg-surface border border-border rounded text-text"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                General Crew Call
              </label>
              <div className="relative">
                <Clock className="w-3 h-3 absolute left-2 top-2 text-text-muted" />
                <input
                  type="text"
                  value={activeSheet.callTime}
                  onChange={(e) => setActiveSheet({ ...activeSheet, callTime: e.target.value })}
                  placeholder="07:00 AM"
                  className="w-full pl-6 pr-2 py-1 bg-surface border border-border rounded text-text font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Primary Location
              </label>
              <div className="relative">
                <MapPin className="w-3 h-3 absolute left-2 top-2 text-text-muted" />
                <input
                  type="text"
                  value={activeSheet.location}
                  onChange={(e) => setActiveSheet({ ...activeSheet, location: e.target.value })}
                  placeholder="Studio Alpha"
                  className="w-full pl-6 pr-2 py-1 bg-surface border border-border rounded text-text truncate"
                />
              </div>
            </div>
          </div>

          {/* Cast Schedule Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
              Cast Call Times
            </span>
            <div className="border border-border rounded-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-2 text-text-muted border-b border-border">
                  <tr>
                    <th className="p-2.5 font-medium">Actor / Name</th>
                    <th className="p-2.5 font-medium">Character Role</th>
                    <th className="p-2.5 font-medium">Individual Call</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeSheet.cast.map((c, idx) => (
                    <tr key={idx} className="hover:bg-surface-2/20">
                      <td className="p-2 font-mono font-medium text-text">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const updatedCast = [...activeSheet.cast];
                            updatedCast[idx].name = e.target.value;
                            setActiveSheet({ ...activeSheet, cast: updatedCast });
                          }}
                          className="w-full bg-transparent outline-none"
                        />
                      </td>
                      <td className="p-2 text-text-muted">
                        <input
                          type="text"
                          value={c.role}
                          onChange={(e) => {
                            const updatedCast = [...activeSheet.cast];
                            updatedCast[idx].role = e.target.value;
                            setActiveSheet({ ...activeSheet, cast: updatedCast });
                          }}
                          className="w-full bg-transparent outline-none"
                        />
                      </td>
                      <td className="p-2 font-mono text-primary">
                        <input
                          type="text"
                          value={c.callTime}
                          onChange={(e) => {
                            const updatedCast = [...activeSheet.cast];
                            updatedCast[idx].callTime = e.target.value;
                            setActiveSheet({ ...activeSheet, cast: updatedCast });
                          }}
                          className="w-full bg-transparent outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Production Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
              Director & Production Notes
            </label>
            <textarea
              value={activeSheet.notes || ""}
              onChange={(e) => setActiveSheet({ ...activeSheet, notes: e.target.value })}
              rows={3}
              placeholder="Catering schedule, safety precautions, weather advisories..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-text leading-relaxed outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              deleteCallSheet(activeSheet.id);
              showToast("Deleted call sheet", "info");
            }}
            className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Sheet</span>
          </button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="tertiary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button size="sm" variant="primary" onClick={handleSave}>
              Save Call Sheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
