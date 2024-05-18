module.exports = {
  trailingSlash: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  output: 'standalone',
  reactStrictMode: process.env.NODE_ENV === 'development',
};
