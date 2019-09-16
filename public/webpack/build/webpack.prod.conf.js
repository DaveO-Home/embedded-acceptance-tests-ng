

const merge = require("webpack-merge");
const webpack = require("webpack");
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const prdWebpackConfig = merge(baseWebpackConfig({
  mode: "production",
  dist: "../../dist/webpack",
  watch: false
}), {
    devtool: "nosources-source-map",
    output: {
      filename: "[name].[contenthash].js",
    },
    optimization: {
      minimize: true,
    },
    plugins: [
      new webpack.NamedModulesPlugin(),
      new HtmlWebpackPlugin({
        filename: "appl/testapp.html",
        template: "../appl/testapp.html"
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
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require("cssnano"),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
      })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|unit_\test*\.js)/,
          enforce: "pre",
          use: [
            {
              loader: "webpack-strip-block",
              options: {
                start: "develblock:start",
                end: "develblock:end"
              }
            }
          ]
        }
      ]
    }
  });

module.exports = prdWebpackConfig;
