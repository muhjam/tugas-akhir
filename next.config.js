const removeImports = require("next-remove-imports")();


module.exports = removeImports({
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
});
