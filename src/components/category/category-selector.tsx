"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORIES, getCategoryConfig } from "@/lib/constants";
import type { TransactionCategory } from "@/types/transaction";

interface CategorySelectorProps {
  value?: TransactionCategory;
  onChange: (category: TransactionCategory) => void;
  triggerClassName?: string;
}

export function CategorySelector({
  value,
  onChange,
  triggerClassName,
}: CategorySelectorProps) {
  const selectedConfig = value ? getCategoryConfig(value) : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-ink-tertiary",
            triggerClassName
          )}
        >
          {selectedConfig ? (
            <span className="flex items-center gap-2">
              <span>{selectedConfig.icon}</span>
              <span>{selectedConfig.name}</span>
            </span>
          ) : (
            "选择分类..."
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2" align="start">
        <div className="grid grid-cols-2 gap-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-parchment-dark dark:hover:bg-midnight/50",
                value === category.id && "bg-galleon-gold/10"
              )}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
                style={{
                  backgroundColor: `${category.color}20`,
                }}
              >
                {category.icon}
              </span>
              <span className="flex-1 text-left">{category.name}</span>
              {value === category.id && (
                <Check className="h-4 w-4 text-galleon-gold" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for inline editing
interface CategorySelectorCompactProps {
  value?: TransactionCategory;
  onChange: (category: TransactionCategory) => void;
}

export function CategorySelectorCompact({
  value,
  onChange,
}: CategorySelectorCompactProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
            value === category.id
              ? "ring-2 ring-galleon-gold"
              : "hover:bg-parchment-dark dark:hover:bg-midnight/50"
          )}
          style={{
            backgroundColor:
              value === category.id
                ? `${category.color}30`
                : `${category.color}15`,
            color: category.color,
          }}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
