require('dotenv').config();

module.exports = {
  trailingSlash: true,
  images: {
    loader: 'custom',
    domains: [],
    unoptimized: true,
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_STRAVA_CLIENT_ID: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
  },
};
