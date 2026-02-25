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
    <div className="min-h-screen bg-parchment dark:bg-midnight">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-parchment-dark/50 backdrop-blur-sm dark:bg-midnight/50 lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="text-xl font-bold text-galleon-gold">Galleon</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-galleon-gold/10 text-galleon-gold"
                      : "text-ink-secondary hover:bg-parchment-dark hover:text-ink-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <p className="text-xs text-ink-tertiary">Galleon v0.1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full min-w-0 lg:ml-64 lg:pb-0 pb-20">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-parchment-dark/95 backdrop-blur-sm dark:bg-midnight/95 lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-galleon-gold"
                    : "text-ink-tertiary hover:text-ink-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
