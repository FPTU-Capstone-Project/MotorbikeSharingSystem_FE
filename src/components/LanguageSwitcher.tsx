import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = memo(() => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    if (i18n.language !== langCode) {
      await i18n.changeLanguage(langCode);
    }
  };

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-150 shadow-sm"
      >
        <GlobeAltIcon className="h-4 w-4 text-gray-600" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {currentLanguage.name}
        </span>
      </motion.button>

      {/* Dropdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 0, scale: 0.95, y: -10 }}
        whileHover={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50"
      >
        <div className="py-2">
          {languages.map((language) => (
            <motion.button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              whileHover={{ backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-100 ${
                i18n.language === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
              {i18n.language === language.code && (
                <motion.div
                  layoutId="activeLang"
                  className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;