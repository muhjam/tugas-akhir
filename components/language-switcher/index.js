import { IoLanguage } from "react-icons/io5";
import { useRouter } from 'next/router';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { locale } = router;

  const changeLanguage = (newLocale) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <button
      onClick={() => changeLanguage(locale === 'en' ? 'id' : 'en')}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5 flex items-center gap-2"
    >
      <IoLanguage className="text-xl" />
      <span>{locale === 'en' ? 'ID' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher; 