
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "halloween" | "halloween-dark" | "froggy" | "froggy-dark";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage?.getItem(storageKey) as Theme) || defaultTheme
  );

  const updateTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove(
      "light", "dark",
      "halloween", "halloween-dark",
      "froggy", "froggy-dark"
    );
    
    // Add new theme class
    root.classList.add(newTheme);
    
    localStorage?.setItem(storageKey, newTheme);
  }, [storageKey]);

  useEffect(() => {
    updateTheme(theme);
  }, [theme, updateTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log(`[Theme] Switching to ${newTheme} theme`);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
