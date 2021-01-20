
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const watch = process.env.USE_WATCH;
const { dev } = require("./config");

const devWebpackConfig = merge(baseWebpackConfig({
    mode: "development",
    dist: dev.assetsRoot,
    watch: watch === "true"
}), {
        devtool: dev.devtool,
        stats: "normal",
        cache: false,
         output: {
            filename: "[name].js",
            publicPath: dev.assetsPublicPath,
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify("development")
            }),
            new webpack.ProgressPlugin(),
            new HtmlWebpackPlugin({
                filename: dev.filename,
                template: dev.template,
                inject: true,
                minify: false,
                chunks: ["main"],
                // necessary to consistently work with multiple chunks via CommonsChunkPlugin
                chunksSortMode: "auto" //"dependency"
            }),
        ]
    });

    module.exports = devWebpackConfig;
