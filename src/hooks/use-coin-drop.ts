"use client";

import { useState, useCallback } from "react";

interface UseCoinDropReturn {
  isOpen: boolean;
  amount: number;
  trigger: (amount?: number) => void;
  close: () => void;
}

export function useCoinDrop(): UseCoinDropReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  const trigger = useCallback((value?: number) => {
    setAmount(value || 0);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    amount,
    trigger,
    close,
  };
}
