import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../engine/storage/db";
import type { ScriptRecord } from "../engine/types";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { ChevronLeft, Printer, AlertTriangle } from "lucide-react";
import "../styles/print.css";

export function PrintRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [script, setScript] = useState<ScriptRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    db.scripts.get(id).then((record) => {
      if (record) {
        setScript(record);
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <p className="text-sm text-text-muted">Loading screenplay print preview…</p>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 space-y-4">
        <AlertTriangle className="w-8 h-8 text-error" />
        <p className="text-sm font-medium text-text">Couldn't load print view.</p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Library
        </Button>
      </div>
    );
  }

  const printableBlocks = script.blocks.filter((b) => b.type !== "note" && b.text.trim() !== "");
  const hasTitlePage = Boolean(script.title || script.writtenBy || script.contactInfo);

  return (
    <div className="min-h-screen bg-bg text-text relative">
      {/* Watermark Overlay across entire page */}
      {script.watermarkText && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-10 select-none overflow-hidden">
          <span className="text-black/10 dark:text-white/10 font-mono font-bold text-6xl md:text-8xl tracking-widest -rotate-45 uppercase text-center max-w-2xl">
            {script.watermarkText}
          </span>
        </div>
      )}

      {/* Top Bar (Hidden on Print) */}
      <header className="no-print h-14 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <IconButton
            label="Back to editor"
            onClick={() => navigate(`/editor/${script.id}`)}
          >
            <ChevronLeft className="w-5 h-5" />
          </IconButton>
          <div>
            <h2 className="text-sm font-semibold text-text">
              Print Preview — {script.title || "Untitled script"}
            </h2>
            <p className="text-[11px] text-text-muted">
              In the browser print dialog, select <strong>"Save as PDF"</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save as PDF
          </Button>
        </div>
      </header>

      {/* Screenplay Page Container */}
      <main className="max-w-[8.5in] mx-auto my-8 p-12 sm:p-16 bg-white text-black shadow-md rounded-card print:shadow-none print:m-0 print:p-0 print:rounded-none font-mono text-[12pt] leading-[1.2] relative">
        {/* Industry Title Page */}
        {hasTitlePage && (
          <div className="h-[9.5in] flex flex-col justify-between text-center pb-16 mb-12 border-b border-gray-200 print:border-none page-break-after-always">
            <div className="pt-32">
              <h1 className="text-2xl font-bold uppercase tracking-wider underline">
                {script.title || "UNTITLED SCREENPLAY"}
              </h1>
              {script.logline && (
                <p className="text-sm italic text-gray-700 max-w-md mx-auto mt-4">
                  "{script.logline}"
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm">written by</p>
              <p className="text-base font-semibold">{script.writtenBy || "Anonymous"}</p>
            </div>

            <div className="text-left text-xs text-gray-700 max-w-xs">
              {script.contactInfo && (
                <p className="whitespace-pre-wrap">{script.contactInfo}</p>
              )}
            </div>
          </div>
        )}

        {printableBlocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm font-sans">
            Nothing to print yet. Add at least one line to your script.
          </div>
        ) : (
          <div>
            {printableBlocks.map((block) => {
              switch (block.type) {
                case "scene_heading":
                  return (
                    <div
                      key={block.id}
                      className="print-scene-heading uppercase font-semibold mt-6 mb-3 tracking-wide flex justify-between"
                    >
                      <span>{block.text}</span>
                      {block.isRevised && <span className="font-bold">*</span>}
                    </div>
                  );
                case "action":
                  return (
                    <div key={block.id} className="print-action my-3 flex justify-between">
                      <span>{block.text}</span>
                      {block.isRevised && <span className="font-bold shrink-0 ml-2">*</span>}
                    </div>
                  );
                case "character":
                  return (
                    <div
                      key={block.id}
                      className={`print-character uppercase mt-3 mb-0 ${
                        block.isDualDialogue ? "text-center w-full" : "ml-[35%] w-[65%]"
                      }`}
                    >
                      {block.text}
                    </div>
                  );
                case "dialogue":
                  return (
                    <div
                      key={block.id}
                      className={`print-dialogue mt-0 mb-3 flex justify-between ${
                        block.isDualDialogue ? "text-center w-full" : "ml-[22%] max-w-[36ch]"
                      }`}
                    >
                      <span>{block.text}</span>
                      {block.isRevised && <span className="font-bold shrink-0 ml-2">*</span>}
                    </div>
                  );
                case "parenthetical":
                  return (
                    <div
                      key={block.id}
                      className={`print-parenthetical mt-0 mb-0 italic ${
                        block.isDualDialogue ? "text-center w-full" : "ml-[26%] max-w-[30ch]"
                      }`}
                    >
                      {block.text.startsWith("(") ? block.text : `(${block.text})`}
                    </div>
                  );
                case "transition":
                  return (
                    <div
                      key={block.id}
                      className="print-transition uppercase font-semibold text-right my-3"
                    >
                      {block.text}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        )}
      </main>
    </div>
  );
}