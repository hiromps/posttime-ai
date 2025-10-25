/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発環境では通常モード、本番ビルド時のみ静的エクスポート
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
  }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
