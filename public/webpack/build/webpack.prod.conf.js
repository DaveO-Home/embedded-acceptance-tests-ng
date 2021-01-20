
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { prod } = require("./config");

const prdWebpackConfig = merge(baseWebpackConfig({
  mode: "production",
  dist: prod.assetsRoot,
  watch: false
}), {
  devtool: prod.devtool,
  output: {
    filename: "[name]-[contenthash:7].js",
    publicPath: prod.assetsPublicPath,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      exclude: /\/dodex\/data/,
    })],
    splitChunks: {
      chunks: "all"
    },
    emitOnErrors: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: prod.filename,
      template: prod.template
    }),
    new webpack.ProgressPlugin(),
    new webpack.NormalModuleReplacementPlugin(/^(.*dev\.env|.*apptest)$/, function (resource) {
      const data = resource.request;
      if (data.match(/dev/)) {
        resource.request = data.replace(/dev/, "prod");
      } else if (data.match(/apptest/)) {
        resource.request = data.replace(/apptest/, "apptest.noop");
      }
    }),
  ],
  module: {
    rules: [
      {
        test: /(\.ts|\.js)devel$/,
        exclude: /(node_modules|.*unit_tests.*\.js)/,
        enforce: "pre",
        use: [
          {
            loader: "webpack-strip-block",
            options: {
              start: "develblock:start",
              end: "develblock:end"
            }
          }
        ],
        // type: "javascript/auto"
      }
    ]
  }
});

module.exports = prdWebpackConfig;
