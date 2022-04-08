
const path = require("path");
const subDirectory = "appl";
const assetsPublicPathDev = "../";
const assetsRootDev = "/dist_test/webpack/";
const assetsRootProd = "/dist/webpack";
const assetsPublicPathProd = "/dist/webpack";
const filenameDev = "appl/testapp_dev.html";
const templateDev = "./appl/testapp_dev.html";
const filenameProd = "appl/testapp.html";
const templateProd = "./appl/testapp.html";
module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: subDirectory,
    assetsPublicPath: assetsPublicPathDev,
    assetsRoot: path.join("../..", assetsRootDev),
    filename: filenameDev,
    template: templateDev,

    host: "localhost", // can be overwritten by process.env.HOST
    port: 3080,        // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    poll: false,       // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    devtool: "eval-cheap-module-source-map",
    autoOpenBrowser: false,
    proxy: {}
  },
  prod: {
    assetsPublicPath: path.join(assetsPublicPathProd, "/"),
    assetsSubDirectory: subDirectory,
    assetsRoot: path.join("../..", assetsRootProd),
    filename: filenameProd,
    template: templateProd,
    devtool: "eval-cheap-module-source-map",
  }
};
