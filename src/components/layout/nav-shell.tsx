"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BarChart3, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "今日", icon: Home },
  { href: "/ledger", label: "账本", icon: BookOpen },
  { href: "/insight", label: "洞察", icon: BarChart3 },
  { href: "/vault", label: "金库", icon: Lock },
];

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background selection:bg-galleon-gold/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-md dark:bg-midnight/30">
        {/* Logo */}
        <div className="flex h-20 items-center px-8 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-500">🪙</span>
            <span className="font-display text-xl font-bold tracking-tight text-ink-primary dark:text-foreground">
              Galleon
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 rounded-md px-4 py-3 text-sm transition-all duration-300",
                      isActive
                        ? "bg-ink-primary text-parchment shadow-sm dark:bg-foreground dark:text-midnight"
                        : "text-ink-secondary hover:bg-black/5 hover:text-ink-primary dark:text-ink-tertiary dark:hover:bg-white/5 dark:hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                    <span className={cn(isActive ? "font-medium" : "font-normal")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-8 py-6 opacity-30 hover:opacity-100 transition-opacity duration-500">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-tertiary">
            Each Galleon Counts
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0 relative">
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="flex h-20 items-center justify-around px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all duration-300",
                  isActive
                    ? "text-ink-primary dark:text-foreground"
                    : "text-ink-tertiary hover:text-ink-secondary"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isActive && "bg-ink-primary/5 dark:bg-white/5"
                )}>
                  <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium uppercase tracking-tighter",
                  isActive ? "opacity-100" : "opacity-0"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
