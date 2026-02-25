"use client";

import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/constants";
import type { TransactionCategory } from "@/types/transaction";

interface CategoryBadgeProps {
  category: TransactionCategory;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showName?: boolean;
  className?: string;
}

export function CategoryBadge({
  category,
  size = "md",
  showIcon = true,
  showName = true,
  className,
}: CategoryBadgeProps) {
  const config = getCategoryConfig(category);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${config.color}20`, // 20 = 12% opacity in hex
        color: config.color,
      }}
    >
      {showIcon && (
        <span className={iconSizes[size]}>{config.icon}</span>
      )}
      {showName && <span>{config.name}</span>}
    </span>
  );
}

// Simple dot variant for compact display
interface CategoryDotProps {
  category: TransactionCategory;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryDot({ category, size = "md", className }: CategoryDotProps) {
  const config = getCategoryConfig(category);

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={cn("inline-block rounded-full", sizeClasses[size], className)}
      style={{ backgroundColor: config.color }}
      title={config.name}
    />
  );
}
