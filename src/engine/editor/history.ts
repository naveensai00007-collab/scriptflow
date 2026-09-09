import type { ScriptBlock } from "../types";

export class HistoryManager {
  private past: ScriptBlock[][] = [];
  private future: ScriptBlock[][] = [];
  private maxDepth: number;

  constructor(maxDepth = 50) {
    this.maxDepth = maxDepth;
  }

  push(currentBlocks: ScriptBlock[]): void {
    // Clone blocks
    const cloned = JSON.parse(JSON.stringify(currentBlocks));
    this.past.push(cloned);
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.future = [];
  }

  undo(currentBlocks: ScriptBlock[]): ScriptBlock[] | null {
    if (this.past.length === 0) return null;

    const previous = this.past.pop()!;
    this.future.unshift(JSON.parse(JSON.stringify(currentBlocks)));
    return previous;
  }

  redo(currentBlocks: ScriptBlock[]): ScriptBlock[] | null {
    if (this.future.length === 0) return null;

    const next = this.future.shift()!;
    this.past.push(JSON.parse(JSON.stringify(currentBlocks)));
    return next;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}
