import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useEditorStore } from "../../state/editorStore";
import type { ScriptBlock } from "../../engine/types";
import { useToast } from "../ui/Toast";

// SpeechRecognition type declarations for browser environment
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

export function DictationButton() {
  const { showToast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleDictation = () => {
    // Check browser support
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      showToast("Speech dictation is supported in Chrome, Edge, and Safari.", "info");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      showToast("Dictation stopped", "info");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult[0]) {
          const spokenText = lastResult[0].transcript.trim();
          if (spokenText) {
            const { currentScript, activeBlockId, updateBlock } = useEditorStore.getState();
            if (activeBlockId && currentScript) {
              const block = currentScript.blocks.find((b: ScriptBlock) => b.id === activeBlockId);
              if (block) {
                const separator = block.text.trim() ? " " : "";
                updateBlock(activeBlockId, `${block.text}${separator}${spokenText}`);
              }
            }
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast("Microphone permission denied or speech error", "error");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      showToast("Listening... speak dialogue or action", "success");
    } catch {
      setIsListening(false);
      showToast("Could not activate microphone", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleDictation}
      className={`p-1.5 rounded-btn flex items-center gap-1 text-xs transition-colors ${
        isListening
          ? "bg-rose-500 text-white animate-pulse"
          : "text-text-muted hover:text-text hover:bg-surface-2"
      }`}
      title={isListening ? "Stop Voice Dictation" : "Start Voice Dictation (Speech-to-Text)"}
    >
      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      {isListening && <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Rec</span>}
    </button>
  );
}
