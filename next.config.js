require('dotenv').config();

module.exports = {
  trailingSlash: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_STRAVA_CLIENT_ID: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
  },
};
