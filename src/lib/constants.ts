// src/lib/constants.ts
// Galleon app constants — categories, icons, colors

import type { TransactionCategory } from "@/types/transaction";

export interface CategoryConfig {
  id: TransactionCategory;
  name: string;
  icon: string;
  color: string;
  darkColor?: string;
}

// 10 preset categories with emoji icons and theme colors
export const CATEGORIES: CategoryConfig[] = [
  { id: "餐饮", name: "餐饮", icon: "☕", color: "#E67E22", darkColor: "#F39C12" },
  { id: "交通", name: "交通", icon: "🚕", color: "#3498DB", darkColor: "#5DADE2" },
  { id: "购物", name: "购物", icon: "🛍️", color: "#E91E63", darkColor: "#F48FB1" },
  { id: "娱乐", name: "娱乐", icon: "🎮", color: "#9B59B6", darkColor: "#BB8FCE" },
  { id: "居住", name: "居住", icon: "🏠", color: "#795548", darkColor: "#A1887F" },
  { id: "医疗", name: "医疗", icon: "💊", color: "#F44336", darkColor: "#E57373" },
  { id: "教育", name: "教育", icon: "📚", color: "#2196F3", darkColor: "#64B5F6" },
  { id: "投资", name: "投资", icon: "💰", color: "#4CAF50", darkColor: "#81C784" },
  { id: "收入", name: "收入", icon: "💵", color: "#2ECC71", darkColor: "#58D68D" },
  { id: "其他", name: "其他", icon: "📦", color: "#607D8B", darkColor: "#90A4AE" },
];

// Map for quick lookup by category name
export const CATEGORY_MAP: Record<TransactionCategory, CategoryConfig> =
  CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {} as Record<TransactionCategory, CategoryConfig>);

// Helper to get category config
export const getCategoryConfig = (
  categoryId: TransactionCategory
): CategoryConfig => {
  return CATEGORY_MAP[categoryId] || CATEGORY_MAP["其他"];
};

// Helper to get category color (auto-switch for dark mode)
export const getCategoryColor = (
  categoryId: TransactionCategory,
  isDark: boolean = false
): string => {
  const config = getCategoryConfig(categoryId);
  return isDark && config.darkColor ? config.darkColor : config.color;
};
