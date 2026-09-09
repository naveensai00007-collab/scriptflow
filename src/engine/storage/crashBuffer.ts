import type { ScriptRecord } from "../types";
import { scriptRecordSchema } from "../schemas";

const CRASH_BUFFER_PREFIX = "scriptflow_crash_";

interface CrashBufferEntry {
  timestamp: number;
  data: ScriptRecord;
}

export function saveCrashBuffer(script: ScriptRecord): void {
  try {
    const entry: CrashBufferEntry = {
      timestamp: Date.now(),
      data: script,
    };
    localStorage.setItem(
      `${CRASH_BUFFER_PREFIX}${script.id}`,
      JSON.stringify(entry)
    );
  } catch (err) {
    // If quota exceeded or private mode, fail silently for buffer
    console.warn("Crash buffer write failed", err);
  }
}

export function readCrashBuffer(scriptId: string): { record: ScriptRecord; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(`${CRASH_BUFFER_PREFIX}${scriptId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== "number" || !parsed.data) {
      return null;
    }

    const validation = scriptRecordSchema.safeParse(parsed.data);
    if (!validation.success) {
      return null;
    }

    return {
      record: validation.data as ScriptRecord,
      timestamp: parsed.timestamp,
    };
  } catch {
    return null;
  }
}

export function clearCrashBuffer(scriptId: string): void {
  try {
    localStorage.removeItem(`${CRASH_BUFFER_PREFIX}${scriptId}`);
  } catch {
    // ignore
  }
}
