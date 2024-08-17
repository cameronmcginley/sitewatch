/** @type {import('next').NextConfig} */ const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Provide a fallback for Node.js built-ins like crypto, if needed
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        process: require.resolve("process/browser"),
      };

      // Add ProvidePlugin to inject process where needed
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
