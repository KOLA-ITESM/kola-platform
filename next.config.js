const path = require('path')

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    swc: false,
    esmExternals: false,
    jsconfigPaths: true // enables it for both jsconfig.json and tsconfig.json
  },
  images: {
    domains: ['images.unsplash.com', 'kola-ingestion-prod.s3.us-east-2.amazonaws.com']
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
