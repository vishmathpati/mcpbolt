/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/install",      destination: "/docs/install",       permanent: true },
      { source: "/quickstart",   destination: "/docs/quickstart",    permanent: true },
      { source: "/cli",          destination: "/docs/cli",           permanent: true },
      { source: "/apps",         destination: "/docs/apps",          permanent: true },
      { source: "/faq",          destination: "/docs/faq",           permanent: true },
      { source: "/security",     destination: "/docs/security",      permanent: true },
      { source: "/troubleshooting", destination: "/docs/troubleshooting", permanent: true },
    ];
  },
}

export default nextConfig
