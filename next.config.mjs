// FootyTracker Next.js Configuration
// PWA integration adapted from: https://github.com/serwist/serwist (1,295 stars, MIT)
// Library Research Agent: Integrated Serwist for PWA support

import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev for easier debugging
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Football-Data.org team crests
      {
        protocol: 'https',
        hostname: 'crests.football-data.org',
      },
      // Wikipedia/Wikimedia for some team badges
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // ESPN for basketball/baseball logos
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
      // NBA logos
      {
        protocol: 'https',
        hostname: 'cdn.nba.com',
      },
      // MLB logos
      {
        protocol: 'https',
        hostname: 'www.mlbstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'midfield.mlbstatic.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withSerwist(nextConfig);

