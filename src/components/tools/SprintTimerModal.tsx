import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Timer, Play, Pause, RotateCcw, Target, Award, Flame } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";

interface SprintTimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SprintTimerModal({ open, onOpenChange }: SprintTimerModalProps) {
  const { currentScript } = useEditorStore();

  const totalWords = useMemo(() => {
    if (!currentScript) return 0;
    return currentScript.blocks.reduce((acc, b) => {
      return acc + b.text.trim().split(/\s+/).filter(Boolean).length;
    }, 0);
  }, [currentScript]);

  const [selectedDuration, setSelectedDuration] = useState(25); // minutes
  const [wordTarget, setWordTarget] = useState(500);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [startWordCount, setStartWordCount] = useState(totalWords);
  const [hasFinished, setHasFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setHasFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStart = () => {
    if (!isActive && secondsRemaining === selectedDuration * 60) {
      setStartWordCount(totalWords);
      setHasFinished(false);
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(selectedDuration * 60);
    setStartWordCount(totalWords);
    setHasFinished(false);
  };

  const handleSelectDuration = (mins: number) => {
    setSelectedDuration(mins);
    setSecondsRemaining(mins * 60);
    setIsActive(false);
    setHasFinished(false);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const wordsWritten = Math.max(0, totalWords - startWordCount);
  const percentComplete = Math.min(100, Math.round((wordsWritten / wordTarget) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-surface border-border flex flex-col items-center select-none">
        <DialogHeader className="w-full text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Timer className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold font-sans">
              Writing Sprint & Word Target
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-text-muted mt-1">
            Lock in and build momentum with timed focus sprints
          </DialogDescription>
        </DialogHeader>

        {/* Timer Display */}
        <div className="my-6 text-center">
          <div className="text-5xl font-mono font-bold text-text tracking-tight">
            {timeFormatted}
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs font-medium text-text-muted">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span>
              {isActive
                ? "Sprint in progress - keep your fingers moving!"
                : hasFinished
                ? "Sprint complete! Take a breather."
                : "Ready when you are."}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          {!isActive ? (
            <Button
              size="md"
              variant="primary"
              onClick={handleStart}
              className="px-6 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Sprint</span>
            </Button>
          ) : (
            <Button
              size="md"
              variant="secondary"
              onClick={handlePause}
              className="px-6 flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </Button>
          )}

          <Button size="md" variant="tertiary" onClick={handleReset} title="Reset Timer">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Duration Selectors */}
        <div className="w-full space-y-1.5 pt-4 border-t border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
            Sprint Duration
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectDuration(mins)}
                disabled={isActive}
                className={`py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedDuration === mins
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-text-muted hover:text-text border border-border"
                } ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Word Count Progress Tracker */}
        <div className="w-full space-y-2 mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-semibold text-text">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span>Sprint Target:</span>
            </div>
            <div className="flex items-center gap-1">
              {[250, 500, 1000].map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setWordTarget(target)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    wordTarget === target
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {target}w
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-border/80">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>{wordsWritten} words written</span>
            <span>{percentComplete}% of target</span>
          </div>

          {wordsWritten >= wordTarget && (
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-center gap-1.5 font-semibold">
              <Award className="w-4 h-4" />
              <span>Target Achieved! Incredible focus.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
