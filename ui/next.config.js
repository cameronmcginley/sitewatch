import webpack from "webpack";
import path from "path";
import { fileURLToPath } from "url";

const { ProvidePlugin } = webpack;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: async (config, { isServer }) => {
    if (!isServer) {
      const crypto = await import("crypto-browserify");
      const stream = await import("stream-browserify");
      const url = await import("url/");
      const zlib = await import("browserify-zlib");
      const http = await import("stream-http");
      const https = await import("https-browserify");
      const assert = await import("assert/");
      const os = await import("os-browserify/browser");
      const pathBrowserify = await import("path-browserify");
      const process = await import("process/browser");

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: crypto.default,
        stream: stream.default,
        url: url.default,
        zlib: zlib.default,
        http: http.default,
        https: https.default,
        assert: assert.default,
        os: os.default,
        path: pathBrowserify.default,
        process: process.default,
      };
    }

    config.plugins.push(
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },
};

export default nextConfig;

// typescript: {
//   ignoreBuildErrors: true,
// },
