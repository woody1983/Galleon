"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  mounted: boolean;
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  mounted: false,
});

// useSyncExternalStore for localStorage - React 19 recommended pattern
function useLocalStorageTheme(storageKey: string, defaultTheme: Theme): Theme {
  return useSyncExternalStore(
    (callback) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === storageKey) callback();
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    () => {
      if (typeof window === "undefined") return defaultTheme;
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    },
    () => defaultTheme
  );
}

// useSyncExternalStore for system color scheme
function useSystemTheme(): "light" | "dark" {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => {
      if (typeof window === "undefined") return "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    () => "light"
  );
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "galleon-theme",
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useLocalStorageTheme(storageKey, defaultTheme);
  const systemTheme = useSystemTheme();
  
  // Compute resolved theme without setState in effect
  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  // Set mounted on client side using requestAnimationFrame to avoid setState in effect
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Apply theme to DOM - no setState here
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  return context;
}
