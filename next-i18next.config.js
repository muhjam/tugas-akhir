module.exports = {
  i18n: {
    defaultLocale: 'id',
    locales: ['en', 'id'],
    localeDetection: false,
  },
  fallbackLng: 'id',
  debug: false,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  defaultNS: 'common',
  localePath: './public/locales',
} 