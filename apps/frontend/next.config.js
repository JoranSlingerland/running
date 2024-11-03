module.exports = {
  trailingSlash: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  output: 'standalone',
  reactStrictMode: process.env.NODE_ENV === 'development',
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
};
