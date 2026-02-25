"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDatabase, clearSeedData, countSeedData } from "@/lib/seed";

// ─── Dev Seed Panel (only rendered in development) ────────────────────────────
function SeedPanel() {
  const [seedCount, setSeedCount] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setSeedCount(await countSeedData());
  };

  useEffect(() => { refresh(); }, []);

  const handleSeed = async () => {
    setIsLoading(true);
    setStatus(null);
    const result = await seedDatabase();
    if (result.skipped) {
      setStatus(`已跳过：数据库中已有 ${seedCount} 条测试数据`);
    } else {
      setStatus(`已插入 ${result.inserted} 条测试数据`);
    }
    await refresh();
    setIsLoading(false);
  };

  const handleClear = async () => {
    setIsLoading(true);
    setStatus(null);
    const deleted = await clearSeedData();
    setStatus(`已清除 ${deleted} 条测试数据`);
    await refresh();
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 border border-dashed border-galleon-gold/40 rounded-xl bg-galleon-gold/5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-galleon-gold" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-galleon-gold">
          Dev · Seed Data
        </h3>
        <span className="ml-auto text-xs font-mono text-ink-tertiary">
          {seedCount !== null ? `${seedCount} 条测试记录` : "…"}
        </span>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSeed}
          disabled={isLoading}
          size="sm"
          className="flex-1 bg-galleon-gold hover:bg-galleon-gold-dark text-white rounded-full"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          导入 50 条测试数据
        </Button>
        <Button
          onClick={handleClear}
          disabled={isLoading || seedCount === 0}
          variant="outline"
          size="sm"
          className="rounded-full text-spell-danger border-spell-danger/30 hover:bg-spell-danger/5 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          清除
        </Button>
      </div>

      {status && (
        <p className="text-xs text-ink-secondary font-body">{status}</p>
      )}

      <p className="text-[10px] text-ink-tertiary font-mono">
        仅在开发模式下可见。测试数据以 __seed__ 标签标记，可单独清除。
      </p>
    </motion.div>
  );
}

// ─── Vault Page ───────────────────────────────────────────────────────────────
export default function VaultPage() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 md:px-12 lg:px-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-tertiary">
            Vault
          </p>
          <h2 className="text-4xl font-bold font-display tracking-tight text-ink-primary dark:text-foreground">
            金库
          </h2>
          <p className="text-sm text-ink-secondary font-body mt-2">
            设置与数据管理
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">
            即将上线
          </p>
          <div className="p-5 border border-border/50 rounded-xl text-ink-tertiary text-sm font-body">
            Gemini API Key 管理、数据导出、生物识别锁定等功能将在 Phase 5 上线。
          </div>
        </section>

        {isDev && (
          <section className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-ink-tertiary">
              开发工具
            </p>
            <SeedPanel />
          </section>
        )}
      </div>
    </div>
  );
}
