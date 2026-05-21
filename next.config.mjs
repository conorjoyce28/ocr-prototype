/** @type {import('next').NextConfig} */
const isPages = process.env.DEPLOY_TARGET === "pages";
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isPages ? "/ocr-prototype" : "",
  assetPrefix: isPages ? "/ocr-prototype/" : "",
};
export default nextConfig;
