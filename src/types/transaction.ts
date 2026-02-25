// src/types/transaction.ts
// Transaction data model — aligned with PRD v2.0 and Gemini AI extraction schema

import { z } from "zod";

// Category enum — matches the PRD's Gemini prompt extraction schema
export const TRANSACTION_CATEGORIES = [
    "餐饮",
    "交通",
    "购物",
    "娱乐",
    "居住",
    "医疗",
    "教育",
    "投资",
    "收入",
    "其他",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

// Zod validation schema — used before writing to Dexie
export const TransactionSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(["expense", "income"]),
    category: z.enum(TRANSACTION_CATEGORIES),
    merchant: z.string().min(1, "Merchant name is required"),
    description: z.string().optional().default(""),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be ISO format (YYYY-MM-DD)"),
    confidence: z.number().min(0).max(1).optional().default(1),
    needsReview: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    aiReasoning: z.string().optional().default(""),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type TransactionInput = z.input<typeof TransactionSchema>;

// Full Transaction type as stored in the database (includes auto-assigned id)
export interface Transaction extends z.output<typeof TransactionSchema> {
    id?: number; // Dexie auto-incremented primary key
}

// Helper to create a today's ISO date string
export const todayISO = (): string => new Date().toISOString().slice(0, 10);

// Helper to build a new transaction with defaults
export const buildTransaction = (
    input: TransactionInput
): Omit<Transaction, "id"> => {
    const now = new Date().toISOString();
    const validated = TransactionSchema.parse(input);
    return {
        ...validated,
        createdAt: now,
        updatedAt: now,
    };
};
