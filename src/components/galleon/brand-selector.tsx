"use client";

// src/components/galleon/brand-selector.tsx
// Animated circular brand buttons for quick-tag drill-down

import { motion, AnimatePresence } from "framer-motion";
import type { BrandConfig } from "@/lib/brands";
import { cn } from "@/lib/utils";

interface BrandSelectorProps {
    brands: BrandConfig[];
    isOpen: boolean;
    onSelect: (brand: BrandConfig) => void;
    onDismiss: () => void;
}

export function BrandSelector({
    brands,
    isOpen,
    onSelect,
    onDismiss,
}: BrandSelectorProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Invisible backdrop to dismiss */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30"
                        onClick={onDismiss}
                    />

                    {/* Brand bubbles */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 z-40 relative"
                    >
                        {brands.map((brand, index) => (
                            <motion.button
                                key={brand.id}
                                initial={{ opacity: 0, scale: 0, x: -20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0,
                                    x: -10,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25,
                                    delay: index * 0.06,
                                }}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onSelect(brand)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 group"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                        "bg-card border-2 border-border",
                                        "shadow-md hover:shadow-lg",
                                        "hover:border-galleon-gold",
                                        "transition-all duration-200"
                                    )}
                                >
                                    <span className="text-xl">{brand.logo}</span>
                                </div>
                                <span className="text-[10px] font-mono text-ink-tertiary group-hover:text-ink-primary transition-colors whitespace-nowrap">
                                    {brand.name}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
