// src/lib/db.ts
// Dexie v4 database — Galleon local-first data layer
// Migration path: Dexie.js (IndexedDB) → SQLite WASM (future)

import Dexie, { type EntityTable } from "dexie";
import type { Transaction } from "@/types/transaction";

// ─── Database Class ────────────────────────────────────────────────────────────

class GalleonDatabase extends Dexie {
    // Strongly typed table
    transactions!: EntityTable<Transaction, "id">;

    constructor() {
        super("GalleonDB");

        // ── Schema version 1: Core transaction schema
        // Indexes: ++id (PK), date, category, type, createdAt
        // NOTE: Non-indexed fields (merchant, amount, etc.) are still stored but
        //       not indexed — add indexes here in future versions as needed.
        this.version(1).stores({
            transactions: "++id, date, category, type, createdAt",
        });

        // ── Migration hook: placeholder for SQLite WASM path
        // When switching to SQLite WASM, export all rows here and re-import.
        // this.version(2).upgrade(async (tx) => {
        //   const rows = await tx.table("transactions").toArray();
        //   // export rows to SQLite WASM...
        // });
    }
}

// ─── Singleton Instance ────────────────────────────────────────────────────────

export const db = new GalleonDatabase();

// ─── Utility: Get today's date range for filtering ────────────────────────────

export const getTodayRange = (): { start: string; end: string } => {
    const now = new Date();
    const start = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
    // end is same day — Dexie range query uses lexicographic string comparison
    const end = start + "\uffff"; // Unicode max char ensures all entries for the day are included
    return { start, end };
};
