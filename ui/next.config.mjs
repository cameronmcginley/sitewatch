import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Providing a specific fallback for crypto
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        process: require.resolve("process/browser"),
      };

      // Ensuring that the ProvidePlugin correctly injects the required modules
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"], // Adding Buffer if it's also needed
          crypto: "crypto-browserify",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
