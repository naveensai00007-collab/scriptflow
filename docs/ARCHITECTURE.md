# ScriptFlow Technical Architecture
**Designed & Built by Naveen Sai**

## Overview

ScriptFlow is engineered with a **local-first, deterministic, zero-data-loss** philosophy. Screenwriting requires immediate keyboard responsiveness (sub-5ms keystroke latency) alongside ironclad persistence.

```
┌─────────────────────────────────────────────────────────────┐
│                       React 18 UI                           │
│  (BlockEditor, Corkboard, BreakdownView, Tools Modals)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Editor Store                     │
│  - Active blocks state                                      │
│  - HistoryManager (50-level Undo/Redo stack)               │
│  - View modes & Editor preferences                          │
└───────────┬──────────────────┬──────────────────────────────┘
            │                  │
            ▼                  ▼
┌───────────────────────┐ ┌───────────────────────────────────┐
│     Derive Engine     │ │          Story & Breakdown        │
│  - Live Pagination    │ │  - Non-Linear Causality Engine    │
│  - Scene Structure    │ │  - Beat Sheet Generator           │
│  - Character Bench    │ │  - Production Element Scanner     │
└───────────────────────┘ └───────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│               SaveQueue & Storage Architecture              │
│  1. Synchronous localStorage Crash Mirror (<1ms)            │
│  2. Asynchronous IndexedDB Storage (Dexie.js)               │
│  3. Automatic Crash Recovery on Startup                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Modules

### 1. Engine & State (`src/engine/` & `src/state/`)
* **`blockOps.ts`**: Pure deterministic functions for splitting, merging, cycling block types, dual dialogue toggling, and whole-script character renaming/merging.
* **`derive/pagination.ts`**: Live dynamic pagination approximating standard 54-line industry pages based on block types, dialogue wrap heights, and scene break rules.
* **`derive/scenes.ts`**: Real-time outline and corkboard scene metadata derivation.
* **`derive/characters.ts`**: Character occurrence tracking and dialogue frequency computation.

### 2. Narrative & Production Engines
* **`ai/storyEngine.ts`**:
  * Evaluates temporal structure (`Linear`, `Non-Linear`, `Parallel Multi-Strand`).
  * Maps screen order against chronological estimates.
  * Ensures intentional twists and flashbacks are not flagged as narrative errors.
* **`production/breakdown.ts`**:
  * Real-time regex and token matching for Cast, Sets, Props, Wardrobe, Vehicles, and Stunts.
  * Daily Call Sheet generator with cast rosters and individual call schedules.

### 3. Storage & Zero Data Loss Guarantee
* Every keystroke updates the Zustand in-memory state and saves to a synchronous crash mirror in `localStorage`.
* A debounced save worker commits the full `ScriptRecord` to IndexedDB via **Dexie.js**.
* On application restart, `loadScript` checks if the crash mirror timestamp exceeds the IndexedDB record, providing seamless automatic recovery.

---

## Anti-AI-Slop Styling Standard

1. **Fonts**: Strictly uninstalled generic sans-serifs (Inter, Roboto, Open Sans). Loaded `@fontsource/space-grotesk` (editorial header), `@fontsource/fraunces` (optical serif), and `@fontsource/courier-prime` (screenplay text).
2. **Palette**: Inspired by celluloid film stocks:
   * **Background**: `#FBF9F4` (Warm Celluloid Paper) / `#12110F` (Dark Obsidian)
   * **Primary Accent**: `#B45309` / `#D97706` (Kodak Amber Gold)
   * **Danger / Alert**: `#E11D48` (Cinnabar Red)

