// next.config.js
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
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
