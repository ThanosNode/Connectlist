import React, { createContext, useContext, useState, useEffect } from "react";

// Debug helper
const debug = (...args: any[]) => console.log('[LanguageContext]', ...args);

export type Language = {
  name: string;
  code: string;
};

const languages: Language[] = [
  { name: "English", code: "en" },
  { name: "Español", code: "es" },
  { name: "Français", code: "fr" },
];

interface LanguageContextType {
  currentLanguage: Language;
  languages: Language[];
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: languages[0],
  languages: languages,
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  // Load saved language from localStorage on mount
  useEffect(() => {
    try {
      debug('Initializing language context');
      const savedLanguage = localStorage.getItem("userLanguage");
      
      if (savedLanguage) {
        try {
          const { code } = JSON.parse(savedLanguage);
          const foundLanguage = languages.find(lang => lang.code === code);
          
          if (foundLanguage) {
            debug('Loaded saved language from localStorage:', foundLanguage.name);
            setCurrentLanguage(foundLanguage);
          } else {
            debug('Saved language not found, using default (English)');
          }
        } catch (error) {
          console.error("Failed to parse saved language:", error);
        }
      } else {
        debug('No saved language, using default (English)');
      }
    } catch (error) {
      console.error("Error initializing language:", error);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      "userLanguage",
      JSON.stringify({
        code: currentLanguage.code,
      })
    );
    debug('Saved language to localStorage:', currentLanguage.name);
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    debug('Setting language:', language.name);
    setCurrentLanguage(language);
  };

  const value = {
    currentLanguage,
    languages,
    setLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};