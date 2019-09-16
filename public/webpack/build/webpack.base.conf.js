const AngularCompilerPlugin = require("@ngtools/webpack").AngularCompilerPlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = (argv) => {
    return {
        mode: argv.mode,
        entry: {
            polyfill: "../appl/polyfills.ts",
            main: "../appl/main.ts"
        },
        output: {
            path: path.join(__dirname, argv.dist)
        },
        resolve: {
            extensions: [".ts", ".js", ".json"],
            alias: {
                "@": resolve("appl"),
                app: resolve("appl/js/app.js"),
                basecontrol: resolve("appl/js/utils/base.control"),
                config: resolve("appl/js/config"),
                default: resolve("appl/js/utils/default"),
                helpers: resolve("appl/js/utils/helpers"),
                menu: resolve("appl/js/utils/menu.js"),
                pdf: resolve("appl/js/controller/pdf"),
                router: resolve("appl/router"),
                start: resolve("appl/js/controller/start"),
                setup: resolve("appl/js/utils/setup"),
                setglobals: resolve("appl/js/utils/set.globals"),
                table: resolve("appl/js/controller/table"),
                tablepager: "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js",
                tablewidgets: "tablesorter/dist/js/jquery.tablesorter.widgets.min.js",
                apptests: resolve("tests/apptest"),
                contacttests: resolve("tests/contacttest"),
                domtests: resolve("tests/domtest"),
                logintests: resolve("tests/logintest"),
                routertests: resolve("tests/routertest"),
                toolstests: resolve("tests/toolstest"),
                handlebars: "handlebars/dist/handlebars.js"
            }
        },
        module: {
            rules: [
                {
                    test: /(\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                    loader: "@ngtools/webpack",
                },
                {
                    test: /\.(html)$/,
                    loader: "raw-loader"
                },
                {
                    test: /\.less$/,
                    loaders: [
                        "raw-loader",
                        "less-loader"
                    ]
                },
                {
                    test: /\.js$/,
                    loader: "babel-loader",
                    include: [resolve("appl"), resolve("tests"), resolve("node_modules/webpack-dev-server/client")]
                },
                {
                    include: [/node_modules/, /appl\/css/],
                    sideEffects: true
                },
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                            //     minimize: false,
                                importLoaders: 1
                            }
                        },
                        // {
                        // 	loader: 'postcss-loader',
                        // 	options: {
                        // 		sourceMap: true
                        // 	}
                        // },
                        {
                            loader: "resolve-url-loader"
                        },
                        {
                            loader: "sass-loader"
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: "file-loader",
                    options: {
                        name: "images/[name].[ext]"
                    }
                },
                {
                    test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [
                        {
                          loader: "url-loader",
                          options: {
                            limit: 10000,
                          },
                        },
                      ],
                },
                {
                    test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                    use: "file-loader"
                },
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                Popper: ["popper.js", "default"]
            }),
            new AngularCompilerPlugin({
                tsConfigPath: path.join(__dirname, "../tsconfig.json"),
                mainPath: path.join(__dirname, "../appl/main"),
                entryModule: path.join(__dirname, "../appl/entry#AppModule"),
                sourceMap: true
            }),
            argv.dist === "development" ? new webpack.NamedModulesPlugin()
                : new webpack.HashedModuleIdsPlugin(),
            new MiniCssExtractPlugin({
                filename: argv.mode === "development"? "[name].css": "[name].[contenthash].css",
                chunkFilename: argv.mode === "development"? "[name].[id].css": "[name].[id].[contenthash].css"
            }),
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, "../static"),
                    to: argv.dist,
                    ignore: [".*"]
                },
                // { from: "../images/favicon.ico", to: argv.dist + "/images" },
                { from: resolve("/appl/index.html"), to: argv.dist },
                { from: "../../README.md", to: "../" },
                { from: resolve("/appl/css/hello.world.css"), to: argv.dist + "/appl/css" },
                { from: resolve("/appl/css/table.css"), to: argv.dist + "/appl/css" },
                { from: resolve("/appl/app_bootstrap.html"), to: argv.dist + "/appl" },
                {
                    from: {
                        glob: resolve("/appl/views/**/*"),
                        dot: false
                    },
                    to: argv.dist + "/appl"
                },
                {
                    from: {
                        glob: resolve("/appl/dodex/**/*"),
                        dot: false
                    },
                    to: argv.dist + "/appl"
                },
                {
                    from: {
                        glob: resolve("/images/**/*"),
                        dot: false
                    },
                    to: argv.dist + "/images"
                },
                {
                    from: {
                        glob: "../appl/templates/**/*",
                        dot: false
                    },
                    to: argv.dist + "/appl"
                },
            ], { debug: "error" })
        ],
        optimization: {
            splitChunks: {
                chunks: "all"
            },
            runtimeChunk: "single"
        },
        watch: argv.watch,
        watchOptions: {
            ignored: /node_modules/
        }
    };

    function setSideEffects(version) {
        if (version > 4) {
            module.exports.module.rules.push(
                {
                    include: /node_modules/,
                    sideEffects: true
                });
            module.exports.module.rules.push(
                {
                    include: /appl\/css/,
                    sideEffects: true
                });
        }
    }
};

function resolve(dir) {
    return path.join(__dirname, "..", dir);
}