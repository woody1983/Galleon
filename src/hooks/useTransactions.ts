// src/hooks/useTransactions.ts
// Live data hook using Dexie's useLiveQuery for reactive UI updates

"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getTodayRange } from "@/lib/db";
import { buildTransaction, todayISO } from "@/types/transaction";
import type { Transaction, TransactionInput } from "@/types/transaction";
import { parseNaturalLanguage, type ParseResult, getGenericMerchantName } from "@/services/parser/localParser";

// ─── Hook: All transactions for today (live) ───────────────────────────────────

export function useTodayTransactions() {
    // Use useMemo to prevent unnecessary re-renders
    const dateRange = useMemo(() => getTodayRange(), []);

    const transactions = useLiveQuery(
        () =>
            db.transactions
                .where("date")
                .between(dateRange.start, dateRange.end, true, true)
                .reverse()
                .toArray(),
        [dateRange.start, dateRange.end]
    );

    const { total, income, expense } = (transactions ?? []).reduce(
        (acc, tx) => {
            if (tx.type === "income") {
                acc.income += tx.amount;
                acc.total += tx.amount;
            } else {
                acc.expense += tx.amount;
                acc.total -= tx.amount;
            }
            return acc;
        },
        { total: 0, income: 0, expense: 0 }
    );

    return {
        transactions: transactions ?? [],
        total,
        income,
        expense,
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

// ─── Hook: Parse text input (for preview) ──────────────────────────────────────

export function useParseInput() {
    /**
     * Parse text input and return structured data for preview
     */
    const parseInput = (rawText: string): ParseResult | null => {
        if (!rawText.trim()) return null;
        return parseNaturalLanguage(rawText);
    };

    return { parseInput };
}

// ─── Hook: Quick-add from text (for the Today page hero input) ─────────────────

export function useQuickAdd() {
    const { addTransaction } = useTransactions();

    /**
     * Parse text input using local NLP parser and add transaction
     * Returns the created transaction ID or null if parsing failed
     */
    const quickAdd = async (rawText: string): Promise<number | null> => {
        if (!rawText.trim()) return null;

        // Use local parser
        const parsed = parseNaturalLanguage(rawText);
        if (!parsed || !parsed.amount) return null;

        // Use category-based generic merchant name if no merchant found
        const merchant = parsed.merchant || getGenericMerchantName(parsed.category);

        return addTransaction({
            amount: parsed.amount,
            type: parsed.type,
            category: parsed.category || "其他",
            merchant,
            description: rawText,
            date: parsed.date || todayISO(),
            confidence: parsed.confidence,
            needsReview: parsed.needsReview,
            tags: [],
            aiReasoning: `Local parse: ${merchant} → ${parsed.category || 'other'}`,
        });
    };

    /**
     * Add a transaction with pre-selected brand data (from brand selector).
     * Bypasses the NLP parser entirely — structured input only.
     */
    const quickAddWithBrand = async (opts: {
        amount: number;
        merchant: string;
        category: TransactionInput["category"];
        subCategory: string;
    }): Promise<number | null> => {
        if (!opts.amount || opts.amount <= 0) return null;

        return addTransaction({
            amount: opts.amount,
            type: "expense",
            category: opts.category,
            subCategory: opts.subCategory,
            merchant: opts.merchant,
            description: `${opts.merchant} ${opts.amount}`,
            date: todayISO(),
            confidence: 1.0,
            needsReview: false,
            tags: [],
            aiReasoning: `Brand select: ${opts.merchant} → ${opts.category} → ${opts.subCategory}`,
        });
    };

    return { quickAdd, quickAddWithBrand };
}
