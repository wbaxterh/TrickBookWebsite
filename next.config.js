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
      // Printed QR codes (keychains, stickers, shop stands) point at /qr/<code> so the
      // code stays short and its destination can change after printing. The UTM tags are
      // picked up as first-touch attribution by lib/analytics.js. Kept temporary so
      // phones never cache the destination. Codes are printed uppercase (/QR/DECK) to
      // keep the QR small; redirect matching is case-insensitive, so both forms land here.
      {
        source: '/qr/:code([A-Za-z0-9_-]+)',
        destination: '/?utm_source=qr&utm_medium=print&utm_campaign=:code',
        permanent: false,
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
