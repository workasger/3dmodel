import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageType, getSavedLanguage } from "../lib/i18n";

interface LanguageContextType {
  currentLanguage: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

// Create context with default value to avoid undefined checks
const defaultLanguage = "ru";
const defaultContext: LanguageContextType = {
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with Russian language or from localStorage if available
  const [currentLanguage, setCurrentLanguage] = useState<LanguageType>(getSavedLanguage());

  useEffect(() => {
    // Set the lang attribute on the html element
    document.documentElement.setAttribute("lang", currentLanguage);
    
    // Save language preference to localStorage
    localStorage.setItem("ihero-language", currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage: setCurrentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context;
};
