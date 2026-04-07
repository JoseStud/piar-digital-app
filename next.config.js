/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.docx$/i,
      type: 'asset/resource',
    });

    return config;
  },
};

module.exports = nextConfig;
