import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In a git worktree, node_modules is symlinked to the main checkout. Turbopack
// rejects that as a symlink pointing "out of the filesystem root", so point its
// root at the real parent of node_modules — the symlinked deps then resolve inside
// the root. For a normal checkout this is just the project dir.
let turbopackRoot = __dirname;
try {
  turbopackRoot = path.dirname(fs.realpathSync(path.join(__dirname, 'node_modules')));
} catch {}

const svgrLoader = {
  loader: '@svgr/webpack',
  options: {
    icon: true,
    svgo: true,
    svgoConfig: {
      plugins: [
        { name: 'removeDimensions', active: true },
        { name: 'removeViewBox', active: false },
      ],
    },
    replaceAttrValues: { '#000': 'currentColor', '#111': 'currentColor', '#fff': 'currentColor', '#ffffff': 'currentColor', '#FFFFFF': 'currentColor', 'white': 'currentColor' },
  },
};

const svgRule = {
  test: /\.svg$/i,
  issuer: /\.[jt]sx?$/,
  resourceQuery: { not: [/url/] }, // `?url` keeps raw file import
  use: [svgrLoader],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, options) {
    // Find the existing rule handling SVGs and exclude SVG from it
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );
    fileLoaderRule.exclude = /\.svg$/i;

    // Add a new rule for SVGs to use @svgr/webpack
    config.module.rules.push(svgRule);

    return config;
  },
  turbopack: {
    root: turbopackRoot,
    rules: {
      '*.svg': {
        loaders: [svgrLoader],
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.chesscomfiles.com', pathname: '/**' },
      { protocol: 'https', hostname: 'api-assets.clashroyale.com', pathname: '/**' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
