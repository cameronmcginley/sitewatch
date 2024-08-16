/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      crypto: require.resolve("crypto-browserify"),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
      })
    );
    return config;
  },
};

export default nextConfig;
