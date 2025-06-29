import React, { useState } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Globe from 'lucide-react/dist/esm/icons/globe';
import useLanguage from '../contexts/useLanguage';
import { SUPPORTED_LANGUAGES, type Language } from '../contexts/languageData';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showLabel = true,
  size = 'md'
}) => {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label htmlFor="language-selector" className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="inline h-4 w-4 mr-1" />
          Select Your Preferred Language
        </label>
      )}
      
      <div className="relative">
        <button
          id="language-selector"
          name="preferredLanguage"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${sizeClasses[size]} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent bg-white text-left flex items-center justify-between hover:border-[#B88271] transition-colors`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{selectedLanguage.flag}</span>
            <div>
              <span className="font-medium text-gray-900">{selectedLanguage.nativeName}</span>
              <span className="text-gray-500 ml-2">({selectedLanguage.name})</span>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#f2e8e5] transition-colors flex items-center space-x-3 ${
                    selectedLanguage.code === language.code 
                      ? 'bg-[#f2e8e5] text-[#B88271]' 
                      : 'text-gray-900'
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <div>
                    <span className="font-medium">{language.nativeName}</span>
                    <span className="text-gray-500 ml-2">({language.name})</span>
                  </div>
                  {selectedLanguage.code === language.code && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-[#B88271] rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;