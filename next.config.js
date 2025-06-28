const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
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
