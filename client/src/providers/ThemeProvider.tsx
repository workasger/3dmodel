import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with dark theme or from localStorage if available
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = typeof window !== "undefined" 
      ? localStorage.getItem("ihero-theme") as Theme | null
      : null;
    return savedTheme || "dark";
  });

  useEffect(() => {
    // Update the data-theme attribute on the html element
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    
    // Save theme preference to localStorage
    localStorage.setItem("ihero-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
