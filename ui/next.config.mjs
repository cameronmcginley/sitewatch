// Using dynamic import() which returns a promiseconst crypto = import('crypto-browserify');
const process = import("process/browser");

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      crypto.then((module) => {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          crypto: module.default,
        };
      });

      process.then((module) => {
        // Add ProvidePlugin to inject process where needed
        config.plugins.push(
          new webpack.ProvidePlugin({
            process: module.default,
          })
        );
      });
    }
    return config;
  },
};

export default nextConfig;
