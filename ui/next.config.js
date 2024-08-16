// next.config.mjs
import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      crypto: await import('crypto-browserify').then(module => module.default),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    );
    return config;
  },
};

export default nextConfig;
