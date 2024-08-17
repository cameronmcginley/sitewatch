import { createRequire } from "module";
const require = createRequire(import.meta.url);

import crypto from "crypto-browserify";
import process from "process/browser.js"; // Ensure the correct path and file extension

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        process: require.resolve("process/browser.js"),
      };

      // Add ProvidePlugin to inject process where needed
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser.js",
        })
      );
    }
    return config;
  },
};

export default nextConfig;
