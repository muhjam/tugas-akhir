import { IoLanguage } from "react-icons/io5";
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation('common');
  
  // Handle language change
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5 flex items-center gap-2"
      aria-label={t('language.switch')}
    >
      <IoLanguage className="text-xl" />
      <span>{t('language.' + (i18n.language === 'en' ? 'en' : 'id'))}</span>
    </button>
  );
};

export default LanguageSwitcher;