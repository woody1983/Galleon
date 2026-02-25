// src/hooks/useTransactions.ts
// Live data hook using Dexie's useLiveQuery for reactive UI updates

"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, getTodayRange } from "@/lib/db";
import { buildTransaction, todayISO } from "@/types/transaction";
import type { Transaction, TransactionInput } from "@/types/transaction";

// ─── Hook: All transactions for today (live) ───────────────────────────────────

export function useTodayTransactions() {
    const { start, end } = getTodayRange();

    const transactions = useLiveQuery(
        () =>
            db.transactions
                .where("date")
                .between(start, end, true, true)
                .reverse()
                .toArray(),
        [start]
    );

    const total = transactions?.reduce((sum, tx) => {
        return tx.type === "expense" ? sum - tx.amount : sum + tx.amount;
    }, 0) ?? 0;

    return {
        transactions: transactions ?? [],
        total,
        isLoading: transactions === undefined,
    };
}

// ─── Hook: CRUD operations ─────────────────────────────────────────────────────

export function useTransactions() {
    const addTransaction = async (input: TransactionInput): Promise<number> => {
        const tx = buildTransaction(input);
        const id = await db.transactions.add(tx as Transaction);
        return id as number;
    };

    const deleteTransaction = async (id: number): Promise<void> => {
        return db.transactions.delete(id);
    };

    const updateTransaction = async (
        id: number,
        updates: Partial<TransactionInput>
    ): Promise<number> => {
        const now = new Date().toISOString();
        return db.transactions.update(id, { ...updates, updatedAt: now });
    };

    return {
        addTransaction,
        deleteTransaction,
        updateTransaction,
    };
}

// ─── Hook: Quick-add from text (for the Today page hero input) ─────────────────

export function useQuickAdd() {
    const { addTransaction } = useTransactions();

    /**
     * Parse simple text input like "星巴克 35" or "35" into a transaction.
     * Full NLP/AI parsing (Gemini) will replace this in Phase 2.
     */
    const quickAdd = async (rawText: string): Promise<number | null> => {
        if (!rawText.trim()) return null;

        // Extract numeric amount
        const amountMatch = rawText.match(/\d+(\.\d+)?/);
        const amount = amountMatch ? parseFloat(amountMatch[0]) : null;
        if (!amount) return null;

        // Extract merchant (text before amount, or after — make it robust)
        const merchant = rawText
            .replace(/\d+(\.\d+)?/, "")
            .trim()
            .replace(/^[-\s]+|[-\s]+$/g, "") || "未知商家";

        return addTransaction({
            amount,
            type: "expense",
            category: "其他",
            merchant,
            description: rawText,
            date: todayISO(),
            confidence: 0.6,
            needsReview: true,
            tags: [],
            aiReasoning: "Local parse — pending AI classification",
        });
    };

    return { quickAdd };
}
