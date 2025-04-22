/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/dashboard',
  //     },
  //     {
  //       source: '/:any*',
  //       destination: '/dashboard/:any*',
  //     }
  //   ];
  // },
  // trailingSlash: false,
  // skipTrailingSlashRedirect: true,
};

export default config;
