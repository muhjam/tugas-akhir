import React from 'react';

export default function Footer({ t }) {
  return (
    <div className="w-full bg-white py-4 border-t border-gray-100 mb-16">
      <div className="max-w-[1080px] mx-auto px-4 text-center text-sm text-gray-600">
        <p>{t('main.subtitle')}</p>
        <p className="mt-1">
          {t('main.developedBy')} 
          <a 
            href="https://www.instagram.com/muhamadjamaludinpad/" 
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jamjam
          </a>
        </p>
      </div>
    </div>
  );
}
