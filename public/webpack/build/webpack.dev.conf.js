const path = require("path");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const { baseWebpackConfig } = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const watch = process.env.USE_WATCH;
const { dev } = require("./config");
const HOST = process.env.HOST;
const PORT = process.env.PORT;

const devWebpackConfig = merge(baseWebpackConfig({
    mode: "development",
    dist: dev.assetsRoot,
    watch: watch === "true"
}), {
        devtool: dev.devtool,
        stats: { colors: true }, //"normal",
        cache: false,
         output: {
            filename: "[name].js",
            publicPath: dev.assetsRootDev,
        },
        devServer: {
            historyApiFallback: {
                rewrites: [
                    { from: /.*/, to: path.join(dev.assetsPublicPath, "index.html") }
                ]
            },
            compress: false,
            host: HOST || dev.host,
            port: PORT || dev.port,
            open: dev.autoOpenBrowser,
            devMiddleware: {
                index: true,
                // mimeTypes: { "text/plain": ["md"] },
                publicPath: "/dist_test/webpack/",
                serverSideRender: false,
                writeToDisk: false,
            },
            client: {
                logging: "info",
                overlay: {
                    errors: true,
                    warnings: false,
                },
                overlay: true,
                progress: true,
            },
            static: {
                directory: path.resolve(__dirname, "../../dist_test"),
                staticOptions: {},
                publicPath: ["/dist_test/"],
                // serveIndex: true,
                // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
                watch: true,
            },
            allowedHosts: "all",
            proxy: {},
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
