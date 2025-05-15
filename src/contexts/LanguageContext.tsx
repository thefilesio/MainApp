import { createContext, useContext, useEffect, useState } from "react";
import { enUS } from "../locales/en-US";
import { deDE } from "../locales/de-DE";

// Define available languages
export type Language = "en" | "de";
export type Translations = typeof enUS;

// Context type
interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language data provider
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    setLanguageState((savedLang === "en" || savedLang === "de") ? savedLang : "en");
    setMounted(true);
  }, []);

  // Get translations based on the current language
  const getTranslations = (): Translations => {
    return language === "de" ? deDE : enUS;
  };

  // Set language and save it to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  if (!mounted) return null;

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        translations: getTranslations(),
        setLanguage 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
