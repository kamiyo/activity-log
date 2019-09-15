const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, './src/index.tsx'),
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].[contenthash].js'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.(t|j)sx?$/,
            include: path.resolve(__dirname, './src'),
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        happyPackMode: true,
                    }
                }
            ]
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './partials/index.html')
        }),
        new ForkTsCheckerPlugin(),
        new NodemonPlugin({
            watch: path.resolve(__dirname, '../server/build/'),
            script: path.resolve(__dirname, '../server/build/index.js'),
            ext: 'js'
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    }
}