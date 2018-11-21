'use strict'
const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const watch = process.env.USE_WATCH

const devWebpackConfig = merge(baseWebpackConfig({
    mode: "development",
    dist: '../../dist_test/webpack',
    watch: watch === 'true'
}), {
        devtool: 'eval-source-map',
        output: {
            filename: "[name].js",
        },
        plugins: [
            new webpack.ProgressPlugin(),
            new webpack.NamedModulesPlugin(),
            new HtmlWebpackPlugin({
                filename: 'appl/testapp_dev.html',
                template: '../appl/testapp_dev.html'
            }),
        ]
    })

module.exports = devWebpackConfig;
