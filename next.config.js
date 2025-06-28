const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    return config;
  },
  reactStrictMode: true,
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

module.exports = nextConfig;
