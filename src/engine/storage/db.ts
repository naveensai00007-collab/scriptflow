import Dexie, { type Table } from "dexie";
import type { ScriptRecord } from "../types";

export interface KVRecord {
  key: string;
  value: unknown;
}

export class ScriptFlowDB extends Dexie {
  scripts!: Table<ScriptRecord, string>;
  kv!: Table<KVRecord, string>;

  constructor() {
    super("scriptflow-db");
    this.version(1).stores({
      scripts: "id, updatedAt",
      kv: "key",
    });
  }
}

export const db = new ScriptFlowDB();
