const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias["~"] = path.resolve(__dirname, "src");
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/chat",
        destination: "/api/chat/route.js",
      },
      {
        source: "/api/bot-info",
        destination: "/api/bot-info/route.js",
      },
    ];
  },
};
