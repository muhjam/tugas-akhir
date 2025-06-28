import React from 'react';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from '../language-switcher';
import { useRouter } from 'next/router';
import { CiLogout } from 'react-icons/ci';

const Navbar = ({ showLogout = false, onLogout }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem('nupkt');
      localStorage.removeItem('password');
      router.push('/');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center gap-3">
            <img src="/math.png" alt="Jam Math Logo" className="w-8 h-8" />
            <span className="font-bold text-gray-800 text-lg">{t('main.title')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {showLogout && (
              <button 
                type="button" 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                <CiLogout className="text-2xl md:text-xl"/>
                <span className="hidden sm:block">{t('main.logout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
