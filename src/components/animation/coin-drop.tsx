"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CoinDropProps {
  amount?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CoinDrop({ amount = 0, isOpen, onClose }: CoinDropProps) {
  const [playSound, setPlaySound] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("galleon-sound-enabled");
    if (stored !== null) {
      setPlaySound(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (playSound) {
        playCoinSound();
      }

      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, playSound, onClose]);

  const playCoinSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } catch {
      // Silently fail
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ y: 200, scale: 0.8, rotateX: 90 }}
            animate={{
              y: 0,
              scale: 1,
              rotateX: 0,
            }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex flex-col items-center"
          >
            <div className="text-7xl drop-shadow-sm select-none">
              🪙
            </div>

            {amount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mt-4 font-mono text-3xl font-bold text-galleon-gold"
              >
                + {amount.toFixed(0)}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
