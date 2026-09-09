import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Film, Tv, Video, Sparkles, Check, BookOpen } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import { generateId } from "../../engine/ids";
import type { ScriptBlock } from "../../engine/types";
import { useToast } from "../ui/Toast";

interface TemplateLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ScriptTemplate {
  id: string;
  title: string;
  category: "Feature" | "Television" | "Short" | "Web" | "Stage";
  description: string;
  pacingNote: string;
  icon: React.ComponentType<{ className?: string }>;
  blocks: ScriptBlock[];
}

const TEMPLATES: ScriptTemplate[] = [
  {
    id: "feature-classic",
    title: "Feature Film (Classic 3-Act Spec)",
    category: "Feature",
    description: "Standard Hollywood & International feature format with Inciting Incident, Midpoint, and Climax.",
    pacingNote: "Target: 90 - 110 pages (~1 min/page)",
    icon: Film,
    blocks: [
      { id: generateId(), type: "scene_heading", text: "INT. PROTAGONIST APARTMENT - DAWN" },
      { id: generateId(), type: "action", text: "A cluttered desk. The morning sun cuts through half-drawn blinds. A lone figure sits hunched over a flickering monitor." },
      { id: generateId(), type: "action", text: "Meet KABIR (30s) -- tired eyes, stubborn jaw, wearing a sweater with frayed cuffs." },
      { id: generateId(), type: "character", text: "KABIR" },
      { id: generateId(), type: "dialogue", text: "Today is the day everything changes. Or everything falls apart." },
      { id: generateId(), type: "note", text: "[ACT I: Establish ordinary world, internal flaw, and ticking clock before p. 10]" },
    ],
  },
  {
    id: "tv-one-hour",
    title: "60-Minute TV Drama (Prestige Pilot)",
    category: "Television",
    description: "Teaser followed by standard 4-Act broadcast/streaming structure with commercial/cliffhanger act outs.",
    pacingNote: "Target: 52 - 58 pages (Teaser + 4 Acts + Tag)",
    icon: Tv,
    blocks: [
      { id: generateId(), type: "scene_heading", text: "TEASER" },
      { id: generateId(), type: "scene_heading", text: "EXT. DESERT HIGHWAY - NIGHT" },
      { id: generateId(), type: "action", text: "Headlights pierce total darkness. A black sedan screeches to an abrupt halt on the shoulder. Dust settles." },
      { id: generateId(), type: "character", text: "DRIVER" },
      { id: generateId(), type: "parenthetical", text: "(into phone, frantic)" },
      { id: generateId(), type: "dialogue", text: "It's gone. The package was never on the manifest." },
      { id: generateId(), type: "transition", text: "SMASH CUT TO:" },
      { id: generateId(), type: "note", text: "[END OF TEASER - Hit title sequence before opening Act I on p. 5]" },
      { id: generateId(), type: "scene_heading", text: "ACT ONE" },
      { id: generateId(), type: "scene_heading", text: "INT. METROPOLITAN PRECINCT - MORNING" },
    ],
  },
  {
    id: "tv-half-hour",
    title: "30-Minute TV Sitcom (Single & Multi-Cam)",
    category: "Television",
    description: "Fast-paced Cold Open into a dynamic two-act comedic escalation with an A & B plot collision.",
    pacingNote: "Target: 28 - 34 pages (Cold Open + Act I + Act II + Tag)",
    icon: Tv,
    blocks: [
      { id: generateId(), type: "scene_heading", text: "COLD OPEN" },
      { id: generateId(), type: "scene_heading", text: "INT. BREAK ROOM - DAY" },
      { id: generateId(), type: "action", text: "PRIYA (20s) stares in disbelief at the office microwave. It is currently smoking." },
      { id: generateId(), type: "character", text: "PRIYA" },
      { id: generateId(), type: "dialogue", text: "Who reheats a foil-wrapped burrito at maximum power?" },
      { id: generateId(), type: "character", text: "SAM" },
      { id: generateId(), type: "parenthetical", text: "(entering, guilty)" },
      { id: generateId(), type: "dialogue", text: "Science didn't say we couldn't." },
      { id: generateId(), type: "transition", text: "MAIN TITLES." },
      { id: generateId(), type: "scene_heading", text: "ACT ONE" },
    ],
  },
  {
    id: "short-film",
    title: "Short Film (Festival Spec)",
    category: "Short",
    description: "Lean, emotionally potent single-dilemma short script optimized for festival showcases.",
    pacingNote: "Target: 8 - 15 pages (Single core turnaround)",
    icon: Video,
    blocks: [
      { id: generateId(), type: "scene_heading", text: "EXT. ROOFTOP WATER TANK - SUNSET" },
      { id: generateId(), type: "action", text: "Wind howls across the galvanized iron tank. MEERA (17) clutches an unsealed letter, staring down at the city grid below." },
      { id: generateId(), type: "character", text: "MEERA" },
      { id: generateId(), type: "dialogue", text: "If you don't jump, you'll never know if you were flying." },
      { id: generateId(), type: "action", text: "A footsteps scuff behind her. A hand reaches into frame." },
      { id: generateId(), type: "note", text: "[SHORT FILM RULE: Introduce the core conflict in scene 1; twist by p. 7]" },
    ],
  },
  {
    id: "stage-play",
    title: "Stage Play (Two-Act Theatrical)",
    category: "Stage",
    description: "Theatrical formatting with dramatis personae character roster, setting descriptions, and proscenium cues.",
    pacingNote: "Target: 80 - 100 pages (Dialogue-driven stagecraft)",
    icon: BookOpen,
    blocks: [
      { id: generateId(), type: "scene_heading", text: "ACT I, SCENE 1" },
      { id: generateId(), type: "action", text: "SETTING: A modest parlor in provincial England, late winter. Upstage right, a fireplace glows dimly. Downstage left, an armoire." },
      { id: generateId(), type: "action", text: "AT RISE: ELEANOR sits upright in an armchair, embroidering a handkerchief with furious precision." },
      { id: generateId(), type: "character", text: "ELEANOR" },
      { id: generateId(), type: "dialogue", text: "The carriage was due an hour ago. Men of honor are rarely so punctual with their excuses." },
    ],
  },
];

export function TemplateLibraryModal({ open, onOpenChange }: TemplateLibraryModalProps) {
  const { createNewScript, loadScript } = useEditorStore();
  const { showToast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate>(TEMPLATES[0]);

  const handleApply = async () => {
    const id = await createNewScript(selectedTemplate.title, selectedTemplate.blocks);
    if (id) {
      await loadScript(id);
      showToast(`Loaded ${selectedTemplate.title}`, "success");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-sans">
                Screenplay Template Library
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Battle-tested industry frameworks formatted to strict Hollywood, TV & Theatre specs
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 overflow-y-auto pr-1">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplate.id === tmpl.id;

            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-card border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                    : "border-border bg-surface-2/40 hover:border-border/80 hover:bg-surface-2"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium uppercase bg-surface border border-border text-primary">
                      {tmpl.category}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-text-muted shrink-0" />
                    <h3 className="text-sm font-bold text-text font-sans leading-tight">
                      {tmpl.title}
                    </h3>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">{tmpl.description}</p>
                </div>

                <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-primary/80">
                  {tmpl.pacingNote}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            Applying creates a new project with formatted beats.
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="tertiary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleApply}>
              Create Script with Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
