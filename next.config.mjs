/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turn off React StrictMode if it causes double-invocation issues in dev, though good for catching bugs.
  reactStrictMode: true,
  // Ensure images from external sources (if any) are configured, but we currently use data URIs or local.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
