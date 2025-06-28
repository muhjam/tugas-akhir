import { IoLanguage } from "react-icons/io5";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('id');
  const router = useRouter();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'id';
    setCurrentLanguage(storedLanguage);
  }, []);

  const changeLanguage = (newLanguage) => {
    localStorage.setItem('language', newLanguage);
    // Set language cookie
    Cookies.set('NEXT_LOCALE', newLanguage, { path: '/' });
    setCurrentLanguage(newLanguage);
    window.location.reload(); // Force reload to apply new language
  };

  return (
    <button
      onClick={() => changeLanguage(currentLanguage === 'en' ? 'id' : 'en')}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5 flex items-center gap-2"
    >
      <IoLanguage className="text-xl" />
      <span>{currentLanguage === 'en' ? 'ID' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher; 