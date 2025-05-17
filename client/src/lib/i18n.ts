import { useEffect, useState } from "react";
import { translations } from "./translations/ru";
import { translations as enTranslations } from "./translations/en";
import { translations as kzTranslations } from "./translations/kz";
import { useLanguage } from "../providers/LanguageProvider";

// All available translations
export const allTranslations = {
  ru: translations,
  en: enTranslations,
  kz: kzTranslations,
};

// Type for language values
export type LanguageType = "ru" | "en" | "kz";

// Get saved language from localStorage if available
export const getSavedLanguage = (): LanguageType => {
  if (typeof window !== "undefined") {
    const savedLang = localStorage.getItem("ihero-language") as LanguageType | null;
    return savedLang || "ru";
  }
  return "ru";  
};

// Simple i18n hook that allows changing languages
export const useTranslation = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [currentTranslations, setCurrentTranslations] = useState(allTranslations[currentLanguage || "ru"]);
  
  useEffect(() => {
    if (currentLanguage) {
      setCurrentTranslations(allTranslations[currentLanguage]);
    }
  }, [currentLanguage]);
  
  // Nested path access function (e.g. "nav.home")
  const t = (key: string): string => {
    const parts = key.split(".");
    let result: any = currentTranslations;
    
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return result;
  };
  
  return {
    t,
    currentLanguage: currentLanguage || "ru",
    changeLanguage: setLanguage,
  };
};
