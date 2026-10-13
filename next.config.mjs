/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NETLIFY ? undefined : "standalone", // Docker uses standalone; Netlify uses its own adapter
  experimental: { serverComponentsExternalPackages: ["node-edge-tts", "ws"] },
};
export default nextConfig;
