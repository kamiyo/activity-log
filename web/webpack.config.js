const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const prod = process.env.NODE_ENV === 'production';
const publicPath = process.env.PUBLIC_PATH || '';

const ForkTsCheckerPlugin = (!prod) ? require('fork-ts-checker-webpack-plugin') : null;
const NodemonPlugin = (!prod) ? require('nodemon-webpack-plugin') : null;

const basePlugins = [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './partials/index.html')
    }),
    new webpack.DefinePlugin({
        PUBLIC_PATH: JSON.stringify(publicPath),
    }),
];

const getDevPlugins = () => [
    ...basePlugins,
    new ForkTsCheckerPlugin({
        checkSyntacticErrors: true
    }),
    new NodemonPlugin({
        watch: path.resolve(__dirname, '../server/build/'),
        script: path.resolve(__dirname, '../server/build/index.js'),
        ext: 'js'
    }),
];

module.exports = {
    entry: path.resolve(__dirname, './src/index.tsx'),
    output: {
        path: path.resolve(__dirname, './build'),
        publicPath,
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
        },
    },
    mode: prod ? 'production' : 'development',
    devtool: prod ? false : 'inline-source-map',
    module: {
        rules: [{
            test: /\.(t|j)sx?$/,
            include: path.resolve(__dirname, './src'),
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    }
                }
            ]
        }]
    },
    plugins: prod ? basePlugins : getDevPlugins(),
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
}