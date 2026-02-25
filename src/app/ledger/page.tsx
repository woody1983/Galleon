"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useAllTransactions,
  useMonthlyStats,
  useTransactions,
} from "@/hooks/useTransactions";
import { CATEGORIES, getCategoryConfig } from "@/lib/constants";
import { TRANSACTION_CATEGORIES } from "@/types/transaction";
import type { Transaction, TransactionCategory } from "@/types/transaction";
import { CategorySelectorCompact } from "@/components/category/category-selector";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DatePreset = "all" | "today" | "week" | "month" | "custom";
type TypeFilter = "all" | "expense" | "income";

interface FilterState {
  search: string;
  categories: TransactionCategory[];
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  typeFilter: TypeFilter;
}

type VirtualRow =
  | { kind: "header"; date: string; label: string }
  | { kind: "tx"; tx: Transaction };

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  return `${m}月${d}日 周${dayNames[date.getDay()]}`;
}

function getDateRangeForPreset(
  preset: DatePreset,
  from: string,
  to: string,
  statsYear: number,
  statsMonth: number
): { start: string; end: string } | null {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  switch (preset) {
    case "today":
      return { start: todayStr, end: todayStr };
    case "week": {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { start: start.toISOString().slice(0, 10), end: todayStr };
    }
    case "month": {
      const start = `${statsYear}-${String(statsMonth).padStart(2, "0")}-01`;
      const endY = statsMonth === 12 ? statsYear + 1 : statsYear;
      const endM = statsMonth === 12 ? 1 : statsMonth + 1;
      const end = `${endY}-${String(endM).padStart(2, "0")}-01`;
      const isCurrentMonth =
        today.getFullYear() === statsYear &&
        today.getMonth() + 1 === statsMonth;
      return { start, end: isCurrentMonth ? todayStr : end };
    }
    case "custom":
      return from && to ? { start: from, end: to } : null;
    default:
      return null;
  }
}

function applyFilters(
  transactions: Transaction[],
  filters: FilterState,
  statsYear: number,
  statsMonth: number
): Transaction[] {
  let result = transactions;

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (tx) =>
        tx.merchant.toLowerCase().includes(q) ||
        (tx.description ?? "").toLowerCase().includes(q) ||
        (tx.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.categories.length > 0) {
    result = result.filter((tx) => filters.categories.includes(tx.category));
  }

  const dateRange = getDateRangeForPreset(
    filters.datePreset,
    filters.dateFrom,
    filters.dateTo,
    statsYear,
    statsMonth
  );
  if (dateRange) {
    result = result.filter(
      (tx) => tx.date >= dateRange.start && tx.date <= dateRange.end
    );
  }

  if (filters.amountMin) {
    const min = parseFloat(filters.amountMin);
    if (!isNaN(min)) result = result.filter((tx) => tx.amount >= min);
  }
  if (filters.amountMax) {
    const max = parseFloat(filters.amountMax);
    if (!isNaN(max)) result = result.filter((tx) => tx.amount <= max);
  }

  if (filters.typeFilter !== "all") {
    result = result.filter((tx) => tx.type === filters.typeFilter);
  }

  return result;
}

function buildRows(transactions: Transaction[]): VirtualRow[] {
  const rows: VirtualRow[] = [];
  let lastDate = "";
  for (const tx of transactions) {
    if (tx.date !== lastDate) {
      rows.push({ kind: "header", date: tx.date, label: formatDateHeader(tx.date) });
      lastDate = tx.date;
    }
    rows.push({ kind: "tx", tx });
  }
  return rows;
}

const EMPTY_FILTER: FilterState = {
  search: "",
  categories: [],
  datePreset: "all",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  typeFilter: "all",
};

function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.categories.length > 0) n++;
  if (f.datePreset !== "all") n++;
  if (f.amountMin || f.amountMax) n++;
  if (f.typeFilter !== "all") n++;
  return n;
}

// ─── Long press hook ───────────────────────────────────────────────────────────

function useLongPress(onLongPress: () => void, duration = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(onLongPress, duration);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
  };
}

// ─── Stats Cards ───────────────────────────────────────────────────────────────

function StatsCards({
  income,
  expense,
  net,
  top3Categories,
  dailyAverage,
  isFiltered,
  statsYear,
  statsMonth,
  onMonthChange,
}: {
  income: number;
  expense: number;
  net: number;
  top3Categories: { category: TransactionCategory; amount: number }[];
  dailyAverage: number;
  isFiltered: boolean;
  statsYear: number;
  statsMonth: number;
  onMonthChange: (year: number, month: number) => void;
}) {
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === statsYear && today.getMonth() + 1 === statsMonth;
  const monthLabel = `${statsYear}年${statsMonth}月`;

  const goToPrev = () => {
    if (statsMonth === 1) onMonthChange(statsYear - 1, 12);
    else onMonthChange(statsYear, statsMonth - 1);
  };
  const goToNext = () => {
    if (isCurrentMonth) return;
    if (statsMonth === 12) onMonthChange(statsYear + 1, 1);
    else onMonthChange(statsYear, statsMonth + 1);
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={goToPrev}
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-tertiary hover:text-ink-primary transition-colors"
          aria-label="上个月"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-ink-secondary">{monthLabel}</span>
          {isFiltered && (
            <span className="text-[10px] bg-galleon-gold/10 text-galleon-gold-dark px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              Filtered
            </span>
          )}
        </div>
        <button
          onClick={goToNext}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-tertiary hover:text-ink-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="下个月"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Income / Expense / Net */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-card border border-border rounded-xl">
        <div className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary mb-1">收入</p>
          <p className="font-mono font-bold text-spell-success text-sm">+{income.toFixed(0)} ¥</p>
        </div>
        <div className="text-center border-x border-border/50">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary mb-1">支出</p>
          <p className="font-mono font-bold text-spell-danger text-sm">-{expense.toFixed(0)} ¥</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary mb-1">净额</p>
          <p className={cn(
            "font-mono font-bold text-sm",
            net >= 0 ? "text-spell-success" : "text-spell-danger"
          )}>
            {net >= 0 ? "+" : ""}{net.toFixed(0)} ¥
          </p>
        </div>
      </div>

      {/* Top 3 categories + daily average */}
      {(top3Categories.length > 0 || dailyAverage > 0) && (
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary">支出分布</p>
            {dailyAverage > 0 && (
              <p className="text-[10px] font-mono text-ink-tertiary">
                日均 <span className="text-spell-danger font-bold">{dailyAverage.toFixed(0)} ¥</span>
              </p>
            )}
          </div>
          {top3Categories.length > 0 ? (
            <div className="space-y-1.5">
              {top3Categories.map(({ category, amount }, i) => {
                const config = getCategoryConfig(category);
                return (
                  <div key={category} className="flex items-center gap-2">
                    <span className="text-sm w-5">{config.icon}</span>
                    <span className="text-xs text-ink-secondary flex-1">{config.name}</span>
                    <span className="font-mono text-xs font-bold text-spell-danger">
                      {amount.toFixed(0)} ¥
                    </span>
                    <span className="text-[10px] text-ink-tertiary font-mono w-4 text-right">
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-ink-tertiary text-center py-1">暂无支出记录</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onClear: () => void;
}) {
  const DATE_PRESETS: { value: DatePreset; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "today", label: "今天" },
    { value: "week", label: "本周" },
    { value: "month", label: "本月" },
    { value: "custom", label: "自定义" },
  ];

  const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "expense", label: "支出" },
    { value: "income", label: "收入" },
  ];

  const toggleCategory = (cat: TransactionCategory) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ categories: next });
  };

  const allSelected = filters.categories.length === TRANSACTION_CATEGORIES.length;

  const selectAllToggle = () => {
    onChange({ categories: allSelected ? [] : [...TRANSACTION_CATEGORIES] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border rounded-xl p-4 space-y-4"
    >
      {/* Type toggle */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">类型</p>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ typeFilter: value })}
              className={cn(
                "flex-1 py-1.5 rounded-full text-xs font-medium transition-all border",
                filters.typeFilter === value
                  ? "bg-ink-primary text-parchment border-ink-primary dark:bg-foreground dark:text-midnight"
                  : "border-border text-ink-secondary hover:border-ink-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date presets */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">时间范围</p>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ datePreset: value })}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                filters.datePreset === value
                  ? "bg-ink-primary text-parchment border-ink-primary dark:bg-foreground dark:text-midnight"
                  : "border-border text-ink-secondary hover:border-ink-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {filters.datePreset === "custom" && (
          <div className="flex gap-2 mt-2">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              className="h-8 text-xs border-border"
            />
            <span className="text-ink-tertiary self-center text-xs">→</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ dateTo: e.target.value })}
              className="h-8 text-xs border-border"
            />
          </div>
        )}
      </div>

      {/* Category chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">分类</p>
          <button
            onClick={selectAllToggle}
            className="text-[10px] text-galleon-gold hover:text-galleon-gold-dark font-medium"
          >
            {allSelected ? "全不选" : "全选"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                  active
                    ? "bg-ink-primary text-parchment border-ink-primary dark:bg-foreground dark:text-midnight"
                    : "border-border text-ink-secondary hover:border-ink-primary"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount range */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">金额范围 (¥)</p>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={filters.amountMin}
            onChange={(e) => onChange({ amountMin: e.target.value })}
            placeholder="最小"
            className="h-8 text-xs border-border"
          />
          <span className="text-ink-tertiary text-xs shrink-0">—</span>
          <Input
            type="number"
            value={filters.amountMax}
            onChange={(e) => onChange({ amountMax: e.target.value })}
            placeholder="最大"
            className="h-8 text-xs border-border"
          />
        </div>
      </div>

      {/* Clear button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="w-full rounded-full text-xs"
      >
        <X className="h-3 w-3 mr-1" />
        清除所有筛选
      </Button>
    </motion.div>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  tx,
  onSave,
  onClose,
}: {
  tx: Transaction;
  onSave: (id: number, updates: Partial<Transaction>) => Promise<number>;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(tx.amount.toString());
  const [merchant, setMerchant] = useState(tx.merchant);
  const [category, setCategory] = useState<TransactionCategory>(tx.category);
  const [type, setType] = useState<"expense" | "income">(tx.type);
  const [date, setDate] = useState(tx.date);
  const [notes, setNotes] = useState(tx.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const isValid = parseFloat(amount) > 0 && merchant.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || isSaving || tx.id === undefined) return;
    setIsSaving(true);
    await onSave(tx.id, {
      amount: parseFloat(amount),
      merchant: merchant.trim(),
      category,
      type,
      date,
      description: notes,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink-primary dark:text-foreground flex items-center gap-2">
            <Pencil className="h-4 w-4 text-galleon-gold" />
            编辑记录
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-tertiary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-medium transition-all",
                type === t
                  ? t === "expense"
                    ? "bg-spell-danger text-white"
                    : "bg-spell-success text-white"
                  : "border border-border text-ink-tertiary hover:border-ink-secondary"
              )}
            >
              {t === "expense" ? "支出" : "收入"}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">金额</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="text-2xl font-mono font-bold h-14 border-border"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">商户</label>
          <Input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="商户名称"
            className="h-10 border-border"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">日期</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 border-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">分类</label>
          <CategorySelectorCompact value={category} onChange={setCategory} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">备注</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="可选备注..."
            className="h-10 border-border"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full">
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="flex-1 bg-galleon-gold hover:bg-galleon-gold-dark text-white rounded-full disabled:opacity-50"
          >
            <Check className="h-4 w-4 mr-1" />
            保存
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
      >
        <h3 className="font-bold text-ink-primary dark:text-foreground">{title}</h3>
        <p className="text-sm text-ink-secondary">{message}</p>
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 rounded-full"
          >
            取消
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              "flex-1 rounded-full text-white",
              danger
                ? "bg-spell-danger hover:bg-spell-danger/90"
                : "bg-galleon-gold hover:bg-galleon-gold-dark"
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Transaction Card (Ledger variant) ────────────────────────────────────────

function LedgerTransactionCard({
  tx,
  onEdit,
  onDelete,
  bulkMode,
  isSelected,
  onToggleSelect,
  onEnterBulkMode,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  bulkMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEnterBulkMode: (id: number) => void;
}) {
  const config = getCategoryConfig(tx.category);
  const displayMerchant =
    tx.merchant.length > 22 ? tx.merchant.slice(0, 22) + "..." : tx.merchant;

  const longPressHandlers = useLongPress(() => {
    if (!bulkMode && tx.id !== undefined) {
      onEnterBulkMode(tx.id);
    }
  });

  const handleCardClick = () => {
    if (bulkMode) {
      if (tx.id !== undefined) onToggleSelect(tx.id);
    } else {
      onEdit(tx);
    }
  };

  return (
    <div
      {...longPressHandlers}
      onClick={handleCardClick}
      className={cn(
        "flex items-center gap-4 p-4 bg-card/40 border rounded-xl transition-all select-none cursor-pointer group",
        bulkMode
          ? isSelected
            ? "border-galleon-gold bg-galleon-gold/5"
            : "border-border hover:border-galleon-gold/50"
          : "border-border/50 hover:bg-card hover:border-border"
      )}
    >
      {bulkMode ? (
        <div className="shrink-0 text-galleon-gold">
          {isSelected ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5 text-ink-tertiary" />
          )}
        </div>
      ) : (
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-background border border-border">
          <span className="text-xl" role="img" aria-label={config.name}>
            {config.icon}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-ink-primary dark:text-foreground truncate">
          {displayMerchant}
        </h4>
        <p className="text-xs text-ink-tertiary flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span>{config.icon}</span>
          <span>{tx.category}</span>
          {tx.subCategory && (
            <span className="text-[10px] bg-galleon-gold/10 text-galleon-gold-dark px-1 py-0.5 rounded font-medium">
              {tx.subCategory}
            </span>
          )}
          {tx.needsReview && (
            <span className="text-[10px] bg-spell-danger/10 text-spell-danger px-1 py-0.5 rounded font-bold">
              Review
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <p className={cn(
          "font-mono font-bold text-sm",
          tx.type === "expense" ? "text-spell-danger" : "text-spell-success"
        )}>
          {tx.type === "expense" ? "-" : "+"}{tx.amount.toFixed(0)} ¥
        </p>
        {!bulkMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tx);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-spell-danger/10 text-ink-tertiary hover:text-spell-danger transition-all"
            aria-label={`删除 ${tx.merchant}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Date Group Header ─────────────────────────────────────────────────────────

function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="pt-5 pb-2 px-1">
      <p className="text-xs font-mono text-ink-tertiary tracking-wide">{label}</p>
    </div>
  );
}

// ─── Ledger Page ───────────────────────────────────────────────────────────────

export default function LedgerPage() {
  const today = new Date();
  const [statsYear, setStatsYear] = useState(today.getFullYear());
  const [statsMonth, setStatsMonth] = useState(today.getMonth() + 1);

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop);
    }
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { transactions, isLoading } = useAllTransactions();
  const { updateTransaction, deleteTransaction } = useTransactions();

  // Monthly stats (always full-month, unfiltered — used when no filters active)
  const monthlyStats = useMonthlyStats(statsYear, statsMonth);

  const activeFilterCount = useMemo(
    () => countActiveFilters({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const handleMonthChange = useCallback((year: number, month: number) => {
    setStatsYear(year);
    setStatsMonth(month);
    setFilters((prev) => ({ ...prev, datePreset: "month" }));
  }, []);

  const filteredTransactions = useMemo(() => {
    const effectiveFilters = { ...filters, search: debouncedSearch };
    return applyFilters(transactions, effectiveFilters, statsYear, statsMonth);
  }, [transactions, filters, debouncedSearch, statsYear, statsMonth]);

  // Stats: use filtered data when filters are active, otherwise full monthly stats
  const isFiltered = activeFilterCount > 0;
  const displayStats = useMemo(() => {
    if (!isFiltered) return monthlyStats;
    let income = 0, expense = 0;
    const catMap: Partial<Record<TransactionCategory, number>> = {};
    for (const tx of filteredTransactions) {
      if (tx.type === "income") income += tx.amount;
      else {
        expense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] ?? 0) + tx.amount;
      }
    }
    const top3Categories = (
      Object.entries(catMap) as [TransactionCategory, number][]
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));
    const daysInMonth = new Date(statsYear, statsMonth, 0).getDate();
    const isCurrentMonth =
      today.getFullYear() === statsYear && today.getMonth() + 1 === statsMonth;
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
    return {
      income,
      expense,
      net: income - expense,
      top3Categories,
      dailyAverage: daysElapsed > 0 ? expense / daysElapsed : 0,
      isLoading: false,
    };
  }, [isFiltered, filteredTransactions, monthlyStats, statsYear, statsMonth, today]);

  const rows = useMemo(() => buildRows(filteredTransactions), [filteredTransactions]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (i) => (rows[i]?.kind === "header" ? 44 : 80),
    overscan: 5,
    scrollMargin,
  });

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTER);
    setDebouncedSearch("");
  }, []);

  const enterBulkMode = useCallback((firstId: number) => {
    setBulkMode(true);
    setSelectedIds(new Set([firstId]));
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const ids = filteredTransactions
      .map((tx) => tx.id)
      .filter((id): id is number => id !== undefined);
    setSelectedIds(new Set(ids));
  }, [filteredTransactions]);

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  const exitBulkMode = useCallback(() => {
    setBulkMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await deleteTransaction(id);
    }
    setShowBulkDeleteConfirm(false);
    exitBulkMode();
  }, [selectedIds, deleteTransaction, exitBulkMode]);

  const handleDeleteRequest = useCallback((tx: Transaction) => {
    setDeletingTx(tx);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingTx?.id) return;
    await deleteTransaction(deletingTx.id);
    setDeletingTx(null);
  }, [deletingTx, deleteTransaction]);

  const handleUpdate = useCallback(
    async (id: number, updates: Partial<Transaction>) => {
      return updateTransaction(id, updates);
    },
    [updateTransaction]
  );

  return (
    <div className="relative min-h-screen pt-8 pb-24 px-4 md:px-10 lg:px-14">
      {/* Modals */}
      <AnimatePresence>
        {editingTx && (
          <EditModal
            tx={editingTx}
            onSave={handleUpdate}
            onClose={() => setEditingTx(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingTx && (
          <ConfirmDialog
            title="删除记录"
            message={`确认删除「${deletingTx.merchant}」的 ${deletingTx.amount.toFixed(0)} ¥ 记录？此操作不可撤销。`}
            confirmLabel="删除"
            onConfirm={confirmDelete}
            onCancel={() => setDeletingTx(null)}
            danger
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <ConfirmDialog
            title="批量删除"
            message={`确认删除选中的 ${selectedIds.size} 条记录？此操作不可撤销。`}
            confirmLabel={`删除 ${selectedIds.size} 条`}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowBulkDeleteConfirm(false)}
            danger
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-tertiary mb-1">
            Each Galleon Counts
          </p>
          <h1 className="text-3xl font-bold font-display text-ink-primary dark:text-foreground">
            账本
          </h1>
        </header>

        {/* Stats Cards — Issue 2.4 */}
        <StatsCards
          income={displayStats.income}
          expense={displayStats.expense}
          net={displayStats.net}
          top3Categories={displayStats.top3Categories}
          dailyAverage={displayStats.dailyAverage}
          isFiltered={isFiltered}
          statsYear={statsYear}
          statsMonth={statsMonth}
          onMonthChange={handleMonthChange}
        />

        {/* Filter Bar — Issue 2.2 */}
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary pointer-events-none" />
              <Input
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder="搜索商户、描述、标签..."
                className="pl-9 h-10 border-border bg-card"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter({ search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={cn(
                "relative flex items-center gap-2 px-3 h-10 rounded-lg border text-sm font-medium transition-all",
                showFilters || activeFilterCount > 0
                  ? "bg-ink-primary text-parchment border-ink-primary dark:bg-foreground dark:text-midnight"
                  : "bg-card border-border text-ink-secondary hover:border-ink-primary"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">筛选</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-galleon-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <FilterPanel
                filters={filters}
                onChange={updateFilter}
                onClear={clearFilters}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bulk mode toolbar — Issue 2.3 */}
        <AnimatePresence>
          {bulkMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-3 p-3 bg-galleon-gold/10 border border-galleon-gold/30 rounded-xl"
            >
              <span className="text-sm font-medium text-ink-secondary flex-1">
                已选 {selectedIds.size} / {filteredTransactions.length} 条
              </span>
              <button
                onClick={
                  selectedIds.size === filteredTransactions.length
                    ? deselectAll
                    : selectAll
                }
                className="text-xs text-galleon-gold font-medium hover:text-galleon-gold-dark"
              >
                {selectedIds.size === filteredTransactions.length ? "全不选" : "全选"}
              </button>
              <Button
                size="sm"
                disabled={selectedIds.size === 0}
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="bg-spell-danger hover:bg-spell-danger/90 text-white rounded-full text-xs px-3 h-7 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                删除 {selectedIds.size > 0 ? selectedIds.size : ""}
              </Button>
              <button
                onClick={exitBulkMode}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline — Issue 2.1 */}
        {isLoading ? (
          <div className="py-16 text-center text-ink-tertiary text-sm font-mono">
            Loading...
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-ink-tertiary font-body">
              {activeFilterCount > 0
                ? "没有符合筛选条件的记录"
                : "还没有记录，去今日页面记一笔吧 🪙"}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-galleon-gold hover:text-galleon-gold-dark font-medium"
              >
                清除筛选
              </button>
            )}
          </div>
        ) : (
          <div ref={listRef}>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const row = rows[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${
                        virtualItem.start - virtualizer.options.scrollMargin
                      }px)`,
                    }}
                  >
                    {row.kind === "header" ? (
                      <DateGroupHeader label={row.label} />
                    ) : (
                      <div className="pb-2">
                        <LedgerTransactionCard
                          tx={row.tx}
                          onEdit={setEditingTx}
                          onDelete={handleDeleteRequest}
                          bulkMode={bulkMode}
                          isSelected={
                            row.tx.id !== undefined &&
                            selectedIds.has(row.tx.id)
                          }
                          onToggleSelect={toggleSelect}
                          onEnterBulkMode={enterBulkMode}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <p className="mt-6 text-center text-[10px] font-mono text-ink-tertiary/50">
            共 {filteredTransactions.length} 条记录
          </p>
        )}
      </div>
    </div>
  );
}
