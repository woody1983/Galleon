// src/hooks/useTransactions.ts
// Live data hook using Dexie's useLiveQuery for reactive UI updates

"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getTodayRange } from "@/lib/db";
import { buildTransaction, todayISO } from "@/types/transaction";
import type { Transaction, TransactionInput, TransactionCategory } from "@/types/transaction";
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
    const addTransaction = async (input: TransactionInput): Promise<number | null> => {
        // Duplicate detection: same amount + merchant within 5 seconds
        const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
        const duplicate = await db.transactions
            .where("createdAt")
            .aboveOrEqual(fiveSecondsAgo)
            .filter(tx => tx.amount === input.amount && tx.merchant === input.merchant)
            .first();
        if (duplicate) return null;

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

// ─── Hook: All transactions (live, ordered by date descending) ─────────────────

export function useAllTransactions() {
    const transactions = useLiveQuery(
        () => db.transactions.orderBy("date").reverse().toArray()
    );
    return {
        transactions: transactions ?? [],
        isLoading: transactions === undefined,
    };
}

// ─── Hook: Monthly stats (aggregated via Dexie date index) ────────────────────

export interface MonthlyStats {
    income: number;
    expense: number;
    net: number;
    top3Categories: { category: TransactionCategory; amount: number }[];
    dailyAverage: number;
    isLoading: boolean;
}

export function useMonthlyStats(year: number, month: number): MonthlyStats {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    // End: first day of next month (exclusive)
    const endYear = month === 12 ? year + 1 : year;
    const endMonth = month === 12 ? 1 : month + 1;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const transactions = useLiveQuery(
        () =>
            db.transactions
                .where("date")
                .between(startDate, endDate, true, false)
                .toArray(),
        [startDate, endDate]
    );

    const txs = transactions ?? [];

    // Days elapsed in month (for daily average calculation)
    const today = new Date();
    const isCurrentMonth =
        today.getFullYear() === year && today.getMonth() + 1 === month;
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;

    let income = 0;
    let expense = 0;
    const categoryTotals: Partial<Record<TransactionCategory, number>> = {};

    for (const tx of txs) {
        if (tx.type === "income") {
            income += tx.amount;
        } else {
            expense += tx.amount;
            categoryTotals[tx.category] =
                (categoryTotals[tx.category] ?? 0) + tx.amount;
        }
    }

    const top3Categories = (
        Object.entries(categoryTotals) as [TransactionCategory, number][]
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount }));

    const dailyAverage = daysElapsed > 0 ? expense / daysElapsed : 0;

    return {
        income,
        expense,
        net: income - expense,
        top3Categories,
        dailyAverage,
        isLoading: transactions === undefined,
    };
}
