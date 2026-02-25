"use client";

import { Mic, Camera, Zap, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoinDrop } from "@/components/animation/coin-drop";
import { useCoinDrop } from "@/hooks/use-coin-drop";
import { useTodayTransactions, useQuickAdd, useParseInput } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { Transaction, TransactionCategory } from "@/types/transaction";
import { getCategoryConfig } from "@/lib/constants";
import type { ParseResult } from "@/services/parser/localParser";

// ─── Category icon with emoji ──────────────────────────────────────────────────
const CategoryIcon = ({ category }: { category: TransactionCategory }) => {
  const config = getCategoryConfig(category);
  return (
    <span className="text-2xl" role="img" aria-label={config.name}>
      {config.icon}
    </span>
  );
};

// ─── Transaction Card ──────────────────────────────────────────────────────────
function TransactionCard({ tx, index }: { tx: Transaction; index: number }) {
  // Truncate merchant name if too long (>20 chars)
  const displayMerchant = tx.merchant.length > 20 
    ? tx.merchant.slice(0, 20) + "..." 
    : tx.merchant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center justify-between p-5 bg-card/40 border border-border/50 rounded-xl hover:bg-card hover:border-border transition-all group"
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-background border border-border group-hover:scale-110 transition-transform">
          <CategoryIcon category={tx.category} />
        </div>
        <div>
          <h4 className="font-bold text-ink-primary dark:text-foreground">{displayMerchant}</h4>
          <p className="text-xs text-ink-tertiary flex items-center gap-2 mt-1">
            {tx.date} · {tx.category}
            {tx.needsReview && (
              <span className="text-[10px] bg-spell-danger/10 text-spell-danger px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                Review
              </span>
            )}
            {tx.confidence !== undefined && tx.confidence < 1 && !tx.needsReview && (
              <span className="text-[10px] bg-spell-info/10 text-spell-info px-1.5 py-0.5 rounded italic">
                AI {Math.round(tx.confidence * 100)}%
              </span>
            )}
          </p>
        </div>
      </div>
      <p className={cn(
        "font-mono font-bold text-lg",
        tx.type === "expense" ? "text-spell-danger" : "text-spell-success"
      )}>
        {tx.type === "expense" ? "-" : "+"}{tx.amount.toFixed(0)} ¥
      </p>
    </motion.div>
  );
}

// ─── Parse Preview Card ────────────────────────────────────────────────────────
function ParsePreview({ 
  parsed, 
  onConfirm, 
  onCancel 
}: { 
  parsed: ParseResult; 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  const config = parsed.category ? getCategoryConfig(parsed.category) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-4 p-4 bg-galleon-gold/5 border border-galleon-gold/20 rounded-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-galleon-gold">Preview</span>
        {parsed.needsReview && (
          <span className="text-[10px] bg-spell-danger/10 text-spell-danger px-2 py-0.5 rounded-full">
            Needs Review
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        {config && (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border">
            <span className="text-xl">{config.icon}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink-primary">
              {parsed.merchant || "Unknown"}
            </span>
            <span className="text-xs text-ink-tertiary">·</span>
            <span className="text-xs text-ink-tertiary">{parsed.category || "其他"}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={cn(
              "font-mono font-bold",
              parsed.type === "expense" ? "text-spell-danger" : "text-spell-success"
            )}>
              {parsed.type === "expense" ? "-" : "+"}{parsed.amount?.toFixed(0) || "?"} ¥
            </span>
            {parsed.parsedDate && (
              <span className="text-xs text-ink-tertiary">{parsed.parsedDate}</span>
            )}
            <span className="text-xs text-ink-tertiary">
              Confidence: {Math.round(parsed.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onConfirm}
          size="sm"
          className="flex-1 bg-galleon-gold hover:bg-galleon-gold-dark text-white rounded-full"
        >
          <Check className="h-4 w-4 mr-1" />
          Confirm
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Daily Summary Card ────────────────────────────────────────────────────────
function DailySummary({ 
  income, 
  expense, 
  net 
}: { 
  income: number; 
  expense: number; 
  net: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-4 p-4 bg-card border border-border rounded-xl mb-8"
    >
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary mb-1">Income</p>
        <p className="font-mono font-bold text-spell-success">+{income.toFixed(0)} ¥</p>
      </div>
      <div className="text-center border-x border-border/50">
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary mb-1">Expense</p>
        <p className="font-mono font-bold text-spell-danger">-{expense.toFixed(0)} ¥</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary mb-1">Net</p>
        <p className={cn(
          "font-mono font-bold",
          net >= 0 ? "text-spell-success" : "text-spell-danger"
        )}>
          {net >= 0 ? "+" : ""}{net.toFixed(0)} ¥
        </p>
      </div>
    </motion.div>
  );
}

// ─── Today Page ────────────────────────────────────────────────────────────────
export default function TodayPage() {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<ParseResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, amount, trigger, close } = useCoinDrop();
  const { transactions, total, isLoading, income, expense } = useTodayTransactions();
  const { quickAdd } = useQuickAdd();
  const { parseInput } = useParseInput();

  // Parse input on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        const result = parseInput(input);
        setPreview(result);
      } else {
        setPreview(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, parseInput]);

  const handleConfirm = async () => {
    if (!preview || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const id = await quickAdd(input);
      if (id && preview.amount) {
        trigger(preview.amount);
      }
      setInput("");
      setPreview(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !preview) return;
    await handleConfirm();
  };

  // Get today's date formatted
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  });

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-6 md:px-12 lg:px-16">
      <CoinDrop isOpen={isOpen} amount={amount} onClose={close} />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex items-end justify-between mb-16 px-2">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-tertiary">
              Each Galleon Counts
            </p>
            <h2 className="text-4xl font-bold font-display tracking-tight text-ink-primary dark:text-foreground">
              {dateStr}
            </h2>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-tertiary mb-1">Today</p>
            <p className={cn(
              "text-2xl font-bold font-mono",
              total <= 0 ? "text-spell-danger" : "text-spell-success"
            )}>
              {total < 0 ? "-" : "+"}{Math.abs(total).toFixed(0)} ¥
            </p>
          </div>
        </header>

        {/* Daily Summary */}
        <DailySummary income={income} expense={expense} net={total} />

        {/* Hero Input */}
        <section className="mb-12">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-galleon-gold/20 to-galleon-gold-dark/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-focus-within:opacity-100" />
            <div className="relative flex flex-col gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="今天花了什么？"
                className="h-12 border-none shadow-none text-xl font-body bg-transparent focus-visible:ring-0 px-2"
              />
              
              {/* Parse Preview */}
              <AnimatePresence>
                {preview && (
                  <ParsePreview 
                    parsed={preview} 
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-ink-tertiary hover:text-ink-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full" disabled title="语音输入 — Phase 3">
                    <Mic className="h-5 w-5 stroke-[1.5px]" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-ink-tertiary hover:text-ink-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full" disabled title="拍照识别 — Phase 3">
                    <Camera className="h-5 w-5 stroke-[1.5px]" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!preview || isSubmitting}
                  className="bg-ink-primary text-parchment hover:bg-ink-secondary dark:bg-foreground dark:text-midnight rounded-full px-6 py-5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 mr-2 fill-current" />
                  <span className="font-medium tracking-tight">Record</span>
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Quick Tags */}
        <section className="flex flex-wrap gap-2 mb-16 justify-center opacity-60 hover:opacity-100 transition-opacity">
          {["☕ 咖啡", "🚕 打车", "🍔 午餐", "🛍️ 购物"].map((tag) => (
            <button
              key={tag}
              onClick={() => setInput(tag)}
              className="px-4 py-1.5 rounded-full border border-border text-[11px] font-medium uppercase tracking-wider hover:bg-ink-primary hover:text-parchment transition-all duration-300"
            >
              {tag}
            </button>
          ))}
        </section>

        {/* Transaction List */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-ink-tertiary">
              Today&apos;s Transactions
            </h3>
            <span className={cn(
              "text-xs font-mono",
              total < 0 ? "text-spell-danger" : "text-spell-success"
            )}>
              {total < 0 ? "-" : "+"}{Math.abs(total).toFixed(0)} ¥
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {isLoading ? (
                <div className="py-12 text-center text-ink-tertiary text-sm font-mono">Loading...</div>
              ) : transactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center"
                >
                  <p className="text-ink-tertiary font-body">还没有记录，开始记一笔吧 🪙</p>
                </motion.div>
              ) : (
                transactions.map((tx: Transaction, i: number) => (
                  <TransactionCard key={tx.id} tx={tx} index={i} />
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* AI Insight Card — placeholder until Phase 3 */}
        <section className="mt-16">
          <div className="relative overflow-hidden p-6 rounded-2xl bg-ink-primary text-parchment dark:bg-white/5 dark:border dark:border-white/10 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Zap className="h-12 w-12" />
            </div>
            <div className="relative z-10">
              <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] mb-4 text-galleon-gold">
                <Zap className="h-3 w-3 fill-current" /> AI Insight
              </h4>
              <p className="text-lg font-display tracking-tight leading-relaxed mb-1">
                AI 洞察功能将在 Phase 3 上线
              </p>
              <p className="text-sm opacity-50 font-body">
                记录更多消费后，Galleon 将为你生成个性化财务建议。
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-32 right-8 lg:bottom-12 lg:right-12">
        <Button className="h-14 w-14 rounded-full bg-galleon-gold hover:bg-galleon-gold-dark text-white shadow-xl shadow-galleon-gold/20 active:scale-90 transition-transform">
          <Zap className="h-6 w-6 fill-current" />
        </Button>
      </div>
    </div>
  );
}
