import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-galleon-gold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              🪙 Galleon
            </h1>
            <p className="mt-2 text-ink-secondary">
              先做出让人上瘾的情感闭环，再逐步叠加智能。
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Palette Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink-primary">颜色系统</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="galleon-gold" bg="bg-galleon-gold" text="text-black" />
            <ColorCard name="galleon-gold-light" bg="bg-galleon-gold-light" text="text-black" />
            <ColorCard name="galleon-gold-dark" bg="bg-galleon-gold-dark" />
            <ColorCard name="gringotts-silver" bg="bg-gringotts-silver" text="text-black" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="parchment" bg="bg-parchment" text="text-black" />
            <ColorCard name="parchment-dark" bg="bg-parchment-dark" text="text-black" />
            <ColorCard name="midnight" bg="bg-midnight" />
            <ColorCard name="spell-success" bg="bg-spell-success" />
          </div>
        </section>

        {/* Typography Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink-primary">字体系统</h2>
          
          <div className="space-y-4 p-6 rounded-lg bg-parchment-dark dark:bg-midnight/50">
            <div>
              <p className="text-sm text-ink-tertiary mb-1">--ink-primary</p>
              <p className="text-2xl text-ink-primary">主要文本 - 记账让财务更清晰</p>
            </div>
            <div>
              <p className="text-sm text-ink-tertiary mb-1">--ink-secondary</p>
              <p className="text-lg text-ink-secondary">次要文本 - 您的每一笔支出都值得记录</p>
            </div>
            <div>
              <p className="text-sm text-ink-tertiary mb-1">--ink-tertiary</p>
              <p className="text-base text-ink-tertiary">辅助文本 - 2024年2月24日</p>
            </div>
          </div>
        </section>

        {/* Spacing Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink-primary">间距系统</h2>
          
          <div className="flex flex-wrap items-end gap-4">
            <SpacingBox size="xs" value="4px" />
            <SpacingBox size="sm" value="8px" />
            <SpacingBox size="md" value="16px" />
            <SpacingBox size="lg" value="24px" />
            <SpacingBox size="xl" value="32px" />
            <SpacingBox size="2xl" value="48px" />
          </div>
        </section>

        {/* Button Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink-primary">按钮组件</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button>默认按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="destructive">危险按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
          </div>
        </section>

        {/* Status */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink-primary">Phase 0 状态</h2>
          <div className="flex gap-4">
            <StatusBadge color="bg-spell-success" label="Step 0.1 完成" />
            <StatusBadge color="bg-spell-success" label="Step 0.2 进行中" />
            <StatusBadge color="bg-spell-info" label="Step 0.3 待开始" />
          </div>
        </section>
      </div>
    </main>
  );
}

function ColorCard({ name, bg, text = "text-white" }: { name: string; bg: string; text?: string }) {
  return (
    <div className={`${bg} ${text} p-4 rounded-lg shadow-sm`}>
      <p className="font-mono text-sm opacity-90">{name}</p>
    </div>
  );
}

function SpacingBox({ size, value }: { size: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="bg-galleon-gold rounded"
        style={{ 
          width: `var(--space-${size})`, 
          height: `var(--space-${size})` 
        }} 
      />
      <span className="text-xs text-ink-tertiary font-mono">{size}: {value}</span>
    </div>
  );
}

function StatusBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className={`${color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
      {label}
    </span>
  );
}
