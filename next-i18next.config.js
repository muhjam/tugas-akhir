module.exports = {
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    localeDetection: false,
  },
  fallbackLng: 'id',
  debug: false,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  defaultNS: 'common',
  localePath: './public/locales',
} 