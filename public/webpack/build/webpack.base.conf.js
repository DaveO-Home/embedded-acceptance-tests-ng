const AngularCompilerPlugin = require("@ngtools/webpack").AngularCompilerPlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = (argv) => {
    return {
        context: path.resolve(__dirname, ""),
        mode: argv.mode,
        entry: {
            polyfill: "../appl/polyfills.ts",
            main: "../appl/main.ts"
        },
        output: {
            path: path.join(__dirname, argv.dist),
            chunkFilename: "main-[name]-[chunkhash].js",
        },
        experiments: {
            asset: true
        },
        node: false,
        target: "web",
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
                    type: "javascript/auto"
                },
                {
                    test: /\.(html)$/,
                    loader: "raw-loader",
                    type: "javascript/auto"
                },
                {
                    test: /\.less$/,
                    use: [ 
                        { loader: "raw-loader" },
                        { loader: "less-loader" }
                    ],
                    type: "javascript/auto"
                },
                {
                    test: /\.js$/,
                    exclude: [/node_modules/, resolve("dodex/data")],        
                    use: ["babel-loader"],
                    type: "javascript/auto"
                },
                {
                    include: [/node_modules/, /appl\/css/],
                    sideEffects: true
                },
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: "css-loader" },
                        { loader: "resolve-url-loader" },
                        { loader: "sass-loader" }
                    ],
                    type: "javascript/auto"
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [{
                        loader: "file-loader",
                        options: {
                            name: "images/[name].[ext]"
                        }
                    }],
                    type: "javascript/auto"
                },
                {
                    test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [
                        {
                          loader: "url-loader",
                          options: {
                            limit: 10000,
                            publicPath: "./",
                            name: "[name]-[hash:4].[ext]"
                          },
                        },
                      ],
                    type: "javascript/auto"
                },
                {
                    test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                publicPath: "./",
                                name: "[name]-[fullhash:4].[ext]"
                            }
                        }
                    ],
                    type: "javascript/auto"
                },
            ],
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                Popper: ["popper.js", "default"],
                process: "process/browser",
            }),
            new AngularCompilerPlugin({
                tsConfigPath: path.join(__dirname, "../tsconfig.json"),
                mainPath: path.join(__dirname, "../appl/main"),
                entryModule: path.join(__dirname, "../appl/entry#AppModule"),
                sourceMap: true
            }),
            new MiniCssExtractPlugin({
                filename: argv.mode === "development"? "[name].css": "[name].[contenthash:7].css",
                chunkFilename: argv.mode === "development"? "[name].[id].css": "[name].[id].[contenthash:7].css"
            }),
            new CopyWebpackPlugin({ patterns: [
                {
                    from: path.resolve(__dirname, "../static"),
                    globOptions: {
                        dot: true,
                        ignore: [".*"],
                      },
                    to: argv.dist,
                },
                { from: resolve("/appl/index.html"), to: argv.dist },
                { from: "../../README.md", to: "../" },
                { from: resolve("/appl/css/hello.world.css"), to: argv.dist + "/appl/css" },
                { from: resolve("/appl/css/table.css"), to: argv.dist + "/appl/css" },
                { from: resolve("/appl/app_bootstrap.html"), to: argv.dist + "/appl" },
                {
                    from: resolve("/appl/views/**/*"),
                    globOptions: {
                        dot: false,
                    },
                    to: argv.dist + "/appl"
                },
                {
                    from: resolve("./appl/dodex/**/*"),
                    globOptions: {
                        dot: false,
                    },
                    to: argv.dist + "/appl"
                },
                {
                    from: resolve("/images/**/*"),
                    globOptions: {
                        dot: false,
                    },
                    to: argv.dist + "/images"
                },
                {
                    from: "../appl/templates/**/*",
                    globOptions: {
                        dot: false,
                    },
                    to: argv.dist + "/appl"
                },
            ]}, { debug: "error" })
        ],
        optimization: {
            moduleIds: argv.dist === "development" ? "named": "deterministic",
            splitChunks: {
                chunks: "all"
            },
            runtimeChunk: "single",
        },
        watch: argv.watch,
        watchOptions: {
            ignored: /node_modules/
        }
    };
};

function resolve(dir) {
    return path.join(__dirname, "..", dir);
}