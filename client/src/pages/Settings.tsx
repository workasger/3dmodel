import { useTranslation, type LanguageType } from "../lib/i18n";
import { useTheme } from "../providers/ThemeProvider";
import { useLanguage } from "../providers/LanguageProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, SunIcon, MoonIcon } from "lucide-react";

const Settings = () => {
  const { t, changeLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { currentLanguage, setLanguage } = useLanguage();

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  // Безопасное приведение типа - только допустимые языки
  const handleLanguageChange = (value: string) => {
    if (value === "ru" || value === "en" || value === "kz") {
      setLanguage(value);
      changeLanguage(value);
    }
  };

  return (
    <div className="relative z-10 px-4 md:px-0 max-w-3xl mx-auto pb-20 pt-8">
      <div className="bg-space-deep/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-8 text-accent">{t("settings.title")}</h2>
        
        {/* Theme toggle */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">{t("settings.themeTitle")}</h3>
          <div className="flex items-center">
            <span className="mr-4 flex items-center gap-2">
              <SunIcon size={20} />
              {t("settings.lightTheme")}
            </span>
            <label className="relative inline-block w-14 h-7">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={theme === "dark"}
                onChange={handleThemeToggle}
              />
              <span className={`theme-slider ${theme === "dark" ? "checked" : ""}`}></span>
            </label>
            <span className="ml-4 flex items-center gap-2">
              <MoonIcon size={20} />
              {t("settings.darkTheme")}
            </span>
          </div>
        </div>
        
        {/* Language selector */}
        <div>
          <h3 className="text-lg font-medium mb-4">{t("settings.languageTitle")}</h3>
          
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full md:w-64 bg-background border-input text-foreground">
              <SelectValue placeholder="Выберите язык" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground">
              <SelectItem value="ru" className="flex items-center gap-2 text-foreground">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-foreground" />
                  Русский
                </div>
              </SelectItem>
              <SelectItem value="en" className="flex items-center gap-2 text-foreground">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-foreground" />
                  English
                </div>
              </SelectItem>
              <SelectItem value="kz" className="flex items-center gap-2 text-foreground">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-foreground" />
                  Қазақша
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
