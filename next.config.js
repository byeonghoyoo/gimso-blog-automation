/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_AI_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
  },
};

module.exports = nextConfig;
