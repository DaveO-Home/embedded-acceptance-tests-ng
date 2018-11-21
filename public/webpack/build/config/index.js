'use strict'

const path = require('path')
const subDirectory = 'appl'
module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: subDirectory,
    assetsPublicPath: '/dist_test/webpack/',
    assetsRoot: path.resolve(__dirname, '../../dist_test/webpack/'),

    host: 'localhost', // can be overwritten by process.env.HOST
    port: 3080,        // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    poll: false,       // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
  },
}
