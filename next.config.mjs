/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  eslint: {
    // Disable ESLint during builds to avoid circular structure error with ESLint 9+
    // ESLint will still work in development via pre-commit hooks
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
