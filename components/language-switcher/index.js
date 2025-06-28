import { IoLanguage } from "react-icons/io5";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation('common');
  
  // Handle language change
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    
    // Update i18n
    i18n.changeLanguage(newLang);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
      // Update HTML lang attribute
      document.documentElement.lang = newLang;
    }
  };

  // Update language on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language');
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
        document.documentElement.lang = savedLang;
      }
    }
  }, [i18n]);

  return (
    <button
      onClick={toggleLanguage}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5 flex items-center gap-2"
      aria-label={t('language.switch')}
    >
      <IoLanguage className="text-xl" />
      <span>{t('language.' + (i18n.language === 'en' ? 'id' : 'en'))}</span>
    </button>
  );
};

export default LanguageSwitcher;