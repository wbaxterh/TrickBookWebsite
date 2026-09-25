// next.config.js
const CANONICAL_HOST = 'thetrickbook.com';

module.exports = {
  // NextAuth builds its OAuth callback from NEXTAUTH_URL (the apex), but Amplify also
  // serves the app on www. A sign-in started on www stored its state cookie on www and
  // came back to the apex without it ("State cookie was missing"), so www is sent to
  // the apex before anything else happens. Keep NEXTAUTH_URL on the apex.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www.${CANONICAL_HOST}` }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
  // Amplify's WEB_COMPUTE packager can omit next-i18next's dynamically loaded
  // core-js modules when the package is externalized. Bundle it with the app so
  // server-side page/data requests do not crash at runtime.
  transpilePackages: ['next-i18next'],
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./node_modules/core-js/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trickbook.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/trickbook/**',
      },
      {
        protocol: 'https',
        hostname: 'api.thetrickbook.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.bunny.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'live.staticflickr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
    ],
  },
};
