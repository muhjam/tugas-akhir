const removeImports = require("next-remove-imports")();
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: false,
  publicRuntimeConfig: {
    default_timezone: 'Asia/Jakarta',
  },
  images: {
    domains: ['sgp1.vultrobjects.com'], 
  },
  rewrites: async () => [
    {
      source: '/_health',
      destination: '/api/_health',
    },
  ],
  trailingSlash: false,
  async redirects() {
    return [];
  }
};

module.exports = removeImports(nextConfig);
