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
    // Load sound preference from localStorage
    const stored = localStorage.getItem("galleon-sound-enabled");
    if (stored !== null) {
      setPlaySound(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Play sound if enabled
      if (playSound) {
        playCoinSound();
      }

      // Auto close after animation
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, playSound, onClose]);

  const playCoinSound = () => {
    // Create a simple coin sound using Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Coin-like sound: high frequency with quick decay
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // Silently fail if audio is not supported
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
          {/* Coin Animation */}
          <motion.div
            initial={{ y: -200, scale: 0.5, rotate: 0 }}
            animate={{
              y: 0,
              scale: 1,
              rotate: 360,
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              rotate: {
                duration: 0.6,
                ease: "easeOut",
              },
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
                ease: "easeInOut",
              }}
              className="text-8xl"
            >
              🪙
            </motion.div>

            {amount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-2xl font-bold text-galleon-gold"
              >
                +¥{amount.toFixed(2)}
              </motion.div>
            )}
          </motion.div>

          {/* Sparkle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 3) * 100,
                y: Math.sin((i * Math.PI) / 3) * 100,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: "easeOut",
              }}
              className="absolute text-galleon-gold text-2xl"
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
