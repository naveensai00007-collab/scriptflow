import { db } from "./db";
import { saveCrashBuffer, clearCrashBuffer } from "./crashBuffer";
import type { ScriptRecord, Result } from "../types";
import { scriptRecordSchema } from "../schemas";

class SaveQueue {
  private isSaving = false;
  private pendingRecord: ScriptRecord | null = null;
  private pendingResolver: ((result: Result<ScriptRecord>) => void) | null = null;

  async save(script: ScriptRecord): Promise<Result<ScriptRecord>> {
    // 1. Write immediately to crash buffer for zero data loss
    saveCrashBuffer(script);

    // 2. Queue write
    if (this.isSaving) {
      this.pendingRecord = script;
      return new Promise<Result<ScriptRecord>>((resolve) => {
        this.pendingResolver = resolve;
      });
    }

    this.isSaving = true;
    try {
      const updatedScript: ScriptRecord = {
        ...script,
        updatedAt: new Date().toISOString(),
      };

      const validation = scriptRecordSchema.safeParse(updatedScript);
      if (!validation.success) {
        return {
          ok: false,
          error: "Validation failed: " + validation.error.message,
        };
      }

      await db.scripts.put(updatedScript);
      clearCrashBuffer(script.id);

      return { ok: true, value: updatedScript };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database write failed";
      return { ok: false, error: msg };
    } finally {
      this.isSaving = false;
      if (this.pendingRecord) {
        const next = this.pendingRecord;
        const resolver = this.pendingResolver;
        this.pendingRecord = null;
        this.pendingResolver = null;
        const result = await this.save(next);
        if (resolver) {
          resolver(result);
        }
      }
    }
  }
}

export const saveQueue = new SaveQueue();
