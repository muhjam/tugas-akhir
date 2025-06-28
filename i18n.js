import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Bahasa default
    fallbackLng: 'id',
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace yang digunakan
    ns: ['common'],
    defaultNS: 'common',
    
    // Konfigurasi backend untuk memuat file terjemahan
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Deteksi bahasa
    detection: {
      // Urutan deteksi bahasa
      order: ['localStorage', 'navigator'],
      
      // Kunci yang digunakan di localStorage
      lookupLocalStorage: 'language',
      
      // Cache bahasa yang terdeteksi
      caches: ['localStorage'],
      
      // Hanya deteksi bahasa yang didukung
      checkWhitelist: true
    },
    
    // Bahasa yang didukung
    supportedLngs: ['id', 'en'],
    
    // Jangan gunakan fallbackLng untuk bahasa yang tidak didukung
    load: 'languageOnly',
    
    // Konfigurasi interpolasi
    interpolation: {
      escapeValue: false, // React sudah melakukan escape
    },
    
    // Konfigurasi React
    react: {
      useSuspense: false,
    },
    
    // Opsi tambahan
    cleanCode: true,
    nonExplicitSupportedLngs: false,
    keySeparator: '.',
    nsSeparator: ':',
  });

// Set bahasa default jika belum diatur
if (typeof window !== 'undefined' && !localStorage.getItem('language')) {
  localStorage.setItem('language', 'id');
  i18n.changeLanguage('id');
}

export default i18n;
