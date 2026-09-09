import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { Button } from "../ui/Button";
import { Sparkles, Compass, Lightbulb, CheckCircle2, ShieldCheck, ArrowRight, Copy } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import {
  generateBeatSheet,
  analyzeNarrativeCausality,
  ORIGINAL_PROMPTS,
  type BeatFramework,
} from "../../engine/ai/storyEngine";
import { useToast } from "../ui/Toast";

interface AIStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIStoryModal({ open, onOpenChange }: AIStoryModalProps) {
  const { currentScript, updateBlock, activeBlockId } = useEditorStore();
  const { showToast } = useToast();

  const [framework, setFramework] = useState<BeatFramework>("save_the_cat");
  const [premise, setPremise] = useState(currentScript?.logline || "");
  const [activeTab, setActiveTab] = useState("beats");

  const beatSheet = useMemo(() => {
    return generateBeatSheet(framework, premise);
  }, [framework, premise]);

  const causalityReport = useMemo(() => {
    if (!currentScript) return null;
    return analyzeNarrativeCausality(currentScript.blocks);
  }, [currentScript]);

  const handleCopyBeatSheet = () => {
    const text = beatSheet
      .map((b) => `${b.title} (${b.pageEstimate}): ${b.description}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    showToast("Beat sheet copied to clipboard", "success");
  };

  const handleInsertPrompt = (promptText: string) => {
    if (activeBlockId && currentScript) {
      const activeBlock = currentScript.blocks.find((b) => b.id === activeBlockId);
      if (activeBlock) {
        const separator = activeBlock.text ? "\n\n" : "";
        updateBlock(activeBlockId, `${activeBlock.text}${separator}[SPARK: ${promptText}]`);
        showToast("Inserted prompt note into active block", "success");
        onOpenChange(false);
        return;
      }
    }
    navigator.clipboard.writeText(promptText);
    showToast("Copied spark to clipboard", "success");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-6 bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-sans">
                Story Intelligence Studio
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Anti-AI-Slop narrative intelligence & craft tools engineered by Naveen Sai
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 mt-4">
          <TabsList className="grid grid-cols-3 mb-4 bg-surface-2 border border-border">
            <TabsTrigger value="beats" className="text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Beat Sheet Engine</span>
            </TabsTrigger>
            <TabsTrigger value="causality" className="text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Causality & Twists</span>
            </TabsTrigger>
            <TabsTrigger value="sparks" className="text-xs flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Anti-Formula Sparks</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BEAT SHEET */}
          <TabsContent value="beats" className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="p-3 bg-surface-2/60 rounded-card border border-border/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-text uppercase tracking-wide">
                  Story Framework
                </label>
                <div className="flex gap-1">
                  {(
                    [
                      { id: "save_the_cat", label: "Save the Cat" },
                      { id: "heros_journey", label: "Hero's Journey" },
                      { id: "story_circle", label: "Story Circle" },
                      { id: "three_act", label: "Three-Act" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFramework(f.id)}
                      className={`px-2.5 py-1 text-xs rounded-btn transition-colors ${
                        framework === f.id
                          ? "bg-primary text-white font-medium"
                          : "bg-surface text-text-muted hover:text-text border border-border/60"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={premise}
                  onChange={(e) => setPremise(e.target.value)}
                  placeholder="Enter your logline or core dilemma..."
                  className="w-full text-xs px-3 py-2 bg-surface border border-border rounded-input outline-none focus:border-primary text-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-text-muted uppercase">
                  {beatSheet.length} Structural Milestones
                </span>
                <Button size="sm" variant="secondary" onClick={handleCopyBeatSheet}>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Beat Sheet</span>
                </Button>
              </div>

              <div className="space-y-2">
                {beatSheet.map((beat) => (
                  <div
                    key={beat.id}
                    className="p-3 rounded-card bg-surface-2/40 border border-border/70 hover:border-border transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text">{beat.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-primary font-mono font-medium">
                          {beat.act}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{beat.pageEstimate}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{beat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CAUSALITY & TWIST INSPECTOR */}
          <TabsContent value="causality" className="flex-1 overflow-y-auto space-y-4 pr-1">
            {causalityReport && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-2/60 border border-border rounded-card">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block">
                      Narrative Architecture
                    </span>
                    <span className="text-sm font-bold text-text mt-0.5 block">
                      {causalityReport.narrativeStructure}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-2/60 border border-border rounded-card">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold block">
                      Causality Status
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {causalityReport.causalityRating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide block">
                    Anti-Plot-Hole Diagnostics
                  </span>
                  <div className="space-y-2">
                    {causalityReport.integrityInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-card bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-text">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{insight.title}</span>
                        </div>
                        <p className="text-text-muted leading-relaxed pl-5">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide block">
                    Scene Sequence Timeline ({causalityReport.timelineNodes.length} Scenes)
                  </span>
                  <div className="border border-border rounded-card overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-surface-2 text-text-muted border-b border-border">
                        <tr>
                          <th className="p-2.5 font-medium">#</th>
                          <th className="p-2.5 font-medium">Slugline</th>
                          <th className="p-2.5 font-medium">Story Time</th>
                          <th className="p-2.5 font-medium">Temporal Nature</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {causalityReport.timelineNodes.map((node) => (
                          <tr key={node.sceneId} className="hover:bg-surface-2/30">
                            <td className="p-2.5 font-mono text-text-muted">{node.sceneNumber}</td>
                            <td className="p-2.5 font-medium text-text truncate max-w-[200px]">
                              {node.heading}
                            </td>
                            <td className="p-2.5 font-mono text-text-muted">
                              T{node.chronologicalEstimate >= 100 ? `+${node.chronologicalEstimate - 100}` : `-${100 - node.chronologicalEstimate}`}
                            </td>
                            <td className="p-2.5">
                              {node.isFlashback && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                  Flashback
                                </span>
                              )}
                              {node.isFlashForward && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                                  Flash-forward
                                </span>
                              )}
                              {node.isParallel && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                                  Simultaneous
                                </span>
                              )}
                              {!node.isFlashback && !node.isFlashForward && !node.isParallel && (
                                <span className="text-[10px] text-text-muted">Chronological</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB 3: ANTI-FORMULA SPARKS */}
          <TabsContent value="sparks" className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-card text-xs text-text-muted leading-relaxed">
              <strong className="text-text font-bold">Anti-AI-Slop Rule:</strong> These sparks avoid
              clichés like "misunderstand and reconcile." They are designed with high subtext, hidden motives,
              and trade-off choices to blast through writer&apos;s block.
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {ORIGINAL_PROMPTS.map((prompt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-card bg-surface-2/40 border border-border/70 hover:border-primary/50 transition-colors flex items-start justify-between gap-4"
                >
                  <p className="text-xs text-text leading-relaxed font-sans">{prompt}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleInsertPrompt(prompt)}
                    className="shrink-0 text-xs"
                  >
                    <span>Use Spark</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
