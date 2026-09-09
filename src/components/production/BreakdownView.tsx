import { useState, useMemo } from "react";
import { useEditorStore } from "../../state/editorStore";
import { generateScriptBreakdown } from "../../engine/production/breakdown";
import type { BreakdownCategory, BreakdownItem } from "../../engine/types";
import { Button } from "../ui/Button";
import {
  Clapperboard,
  Users,
  Building2,
  Package,
  Shirt,
  Car,
  Flame,
  Search,
  Download,
  CalendarDays,
  FileText,
} from "lucide-react";
import { CallSheetModal } from "./CallSheetModal";
import { useToast } from "../ui/Toast";

interface BreakdownViewProps {
  onBackToScript: () => void;
}

const CATEGORY_CONFIG: Record<
  BreakdownCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  cast: { label: "Cast Members", icon: Users, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  set: { label: "Sets & Locations", icon: Building2, color: "text-sky-600 bg-sky-500/10 border-sky-500/20" },
  prop: { label: "Props", icon: Package, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  wardrobe: { label: "Wardrobe", icon: Shirt, color: "text-purple-600 bg-purple-500/10 border-purple-500/20" },
  vehicle: { label: "Vehicles", icon: Car, color: "text-orange-600 bg-orange-500/10 border-orange-500/20" },
  stunt: { label: "Stunts & FX", icon: Flame, color: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
};

export function BreakdownView({ onBackToScript }: BreakdownViewProps) {
  const { currentScript } = useEditorStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BreakdownCategory | "all">("all");
  const [callSheetModalOpen, setCallSheetModalOpen] = useState(false);

  const breakdownItems = useMemo(() => {
    if (!currentScript) return [];
    return generateScriptBreakdown(currentScript.blocks);
  }, [currentScript]);

  const filteredItems = useMemo(() => {
    return breakdownItems.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [breakdownItems, selectedCategory, searchQuery]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: breakdownItems.length };
    for (const item of breakdownItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [breakdownItems]);

  const handleExportCSV = () => {
    if (breakdownItems.length === 0) {
      showToast("No breakdown items to export", "info");
      return;
    }

    const headers = ["Category", "Name", "Scene Numbers", "Notes"];
    const rows = breakdownItems.map((item) => [
      item.category.toUpperCase(),
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.sceneNumbers.join(", ")}"`,
      `"${(item.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentScript?.title || "Script"}_Breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported breakdown to CSV", "success");
  };

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden select-none">
      {/* Top Banner & Control Bar */}
      <div className="p-4 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text">Production Breakdown Suite</h1>
            <p className="text-xs text-text-muted">
              Auto-scanned elements across cast, sets, props, wardrobe, vehicles & stunts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCallSheetModalOpen(true)}
            className="text-xs"
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary" />
            <span>Call Sheets</span>
          </Button>

          <Button size="sm" variant="secondary" onClick={handleExportCSV} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button size="sm" variant="primary" onClick={onBackToScript} className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span>Return to Script</span>
          </Button>
        </div>
      </div>

      {/* Filter & Category Bar */}
      <div className="px-6 py-3 border-b border-border bg-surface-2/40 flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-text-muted hover:text-text border border-border/60"
            }`}
          >
            All Elements ({countsByCategory.all || 0})
          </button>

          {(Object.keys(CATEGORY_CONFIG) as BreakdownCategory[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const Icon = config.icon;
            const count = countsByCategory[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-text-muted hover:text-text border border-border/60"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{config.label}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-surface border border-border rounded-input outline-none focus:border-primary text-text"
          />
        </div>
      </div>

      {/* Grid of Breakdown Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-text-muted">
            <Package className="w-8 h-8 mb-2 opacity-30 text-primary" />
            <p className="text-sm font-semibold">No elements match your criteria.</p>
            <p className="text-xs mt-1 opacity-70">
              Add characters, locations, props or action blocks in the screenplay editor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item: BreakdownItem) => {
              const config = CATEGORY_CONFIG[item.category];
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 bg-surface rounded-card border border-border/80 hover:border-primary/50 shadow-sm transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${config.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-text font-mono truncate" title={item.name}>
                      {item.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-semibold block mb-1">
                      Scenes ({item.sceneNumbers.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.sceneNumbers.slice(0, 6).map((num, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-surface-2 border border-border/80 text-[10px] font-mono text-text-muted"
                        >
                          Sc. {num}
                        </span>
                      ))}
                      {item.sceneNumbers.length > 6 && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono text-text-muted">
                          +{item.sceneNumbers.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CallSheetModal open={callSheetModalOpen} onOpenChange={setCallSheetModalOpen} />
    </div>
  );
}
