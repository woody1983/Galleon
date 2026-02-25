// src/lib/brands.ts
// Quick-tag brand configuration for sub-category drill-down

import type { TransactionCategory } from "@/types/transaction";

// ─── Brand Config ──────────────────────────────────────────────────────────────

export interface BrandConfig {
    id: string;
    name: string;
    logo: string; // emoji or image path
    category: TransactionCategory;
    subCategory: string;
}

export interface QuickTagConfig {
    id: string;
    label: string;
    icon: string;
    category: TransactionCategory;
    subCategory?: string;
    brands?: BrandConfig[];
}

// ─── Coffee Brands ─────────────────────────────────────────────────────────────

const COFFEE_BRANDS: BrandConfig[] = [
    {
        id: "starbucks",
        name: "星巴克",
        logo: "⭐",
        category: "餐饮",
        subCategory: "咖啡",
    },
    {
        id: "luckin",
        name: "瑞幸",
        logo: "🦌",
        category: "餐饮",
        subCategory: "咖啡",
    },
    {
        id: "manner",
        name: "Manner",
        logo: "☕",
        category: "餐饮",
        subCategory: "咖啡",
    },
    {
        id: "kona",
        name: "Kona",
        logo: "🫘",
        category: "餐饮",
        subCategory: "咖啡",
    },
];

// ─── Quick Tags ────────────────────────────────────────────────────────────────

export const QUICK_TAGS: QuickTagConfig[] = [
    {
        id: "coffee",
        label: "☕ 咖啡",
        icon: "☕",
        category: "餐饮",
        subCategory: "咖啡",
        brands: COFFEE_BRANDS,
    },
    {
        id: "taxi",
        label: "🚕 打车",
        icon: "🚕",
        category: "交通",
    },
    {
        id: "lunch",
        label: "🍔 午餐",
        icon: "🍔",
        category: "餐饮",
        subCategory: "午餐",
    },
    {
        id: "shopping",
        label: "🛍️ 购物",
        icon: "🛍️",
        category: "购物",
    },
];
