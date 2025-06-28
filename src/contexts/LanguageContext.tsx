import React, { createContext, useState, useEffect } from 'react';
import type { Language } from './languageData';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from './languageData';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
  getLanguageByCode: (code: string) => Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguageCode = localStorage.getItem('preferredLanguage');
    if (savedLanguageCode) {
      const savedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguageCode);
      if (savedLanguage) {
        setSelectedLanguageState(savedLanguage);
      }
    }
  }, []);

  const setSelectedLanguage = (language: Language) => {
    setSelectedLanguageState(language);
    localStorage.setItem('preferredLanguage', language.code);
  };

  const value = {
    selectedLanguage,
    setSelectedLanguage,
    getLanguageByCode
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };