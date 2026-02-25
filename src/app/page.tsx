"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Camera, Zap } from "lucide-react";
import { CoinDrop } from "@/components/animation/coin-drop";
import { useCoinDrop } from "@/hooks/use-coin-drop";

export default function TodayPage() {
  const [input, setInput] = useState("");
  const { isOpen, amount, trigger, close } = useCoinDrop();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for Phase 1 - just trigger animation
    const parsedAmount = parseFloat(input.replace(/[^\d.]/g, "")) || 35;
    trigger(parsedAmount);
    setInput("");
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <CoinDrop isOpen={isOpen} amount={amount} onClose={close} />
      
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-tertiary">2026年2月24日 周二</p>
            <h1 className="text-2xl font-bold text-ink-primary">今天花了什么？</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-ink-tertiary">今日支出</p>
            <p className="text-2xl font-bold text-galleon-gold">¥0.00</p>
          </div>
        </div>

        {/* Hero Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：星巴克 35，或 昨天打车28"
              className="h-14 pr-32 text-lg"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-ink-tertiary hover:text-ink-primary"
                disabled
                title="语音输入 (Phase 3)"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-ink-tertiary hover:text-ink-primary"
                disabled
                title="拍照输入 (Phase 3)"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-galleon-gold hover:bg-galleon-gold-dark"
              >
                <Zap className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {["☕ 咖啡", "🚕 打车", "🍔 外卖", "🛒 超市"].map((item) => (
            <Button
              key={item}
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setInput(item.replace(/[☕🚕🍔🛒] /, ""))}
            >
              {item}
            </Button>
          ))}
        </div>

        {/* Demo Section */}
        <div className="rounded-lg border border-border bg-parchment-dark/30 p-6 dark:bg-midnight/30">
          <h3 className="mb-4 text-sm font-medium text-ink-tertiary">🪙 金币动画测试</h3>
          <div className="flex gap-2">
            <Button onClick={() => trigger(35)} variant="outline" size="sm">
              测试 ¥35
            </Button>
            <Button onClick={() => trigger(128)} variant="outline" size="sm">
              测试 ¥128
            </Button>
            <Button onClick={() => trigger()} variant="outline" size="sm">
              测试无金额
            </Button>
          </div>
        </div>

        {/* Today's Transactions */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-ink-tertiary">今日记录</h2>
          <div className="rounded-lg border border-border bg-parchment-dark/30 p-8 text-center dark:bg-midnight/30">
            <p className="text-ink-tertiary">还没有记录，开始记一笔吧 🪙</p>
          </div>
        </div>
      </div>
    </div>
  );
}
