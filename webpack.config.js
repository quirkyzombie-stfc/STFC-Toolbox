const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  optimization: {
    usedExports: true,
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif|drawio|txt|exe)$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'STFC Tool',
      //favicon: 'assets/favicon.png',
      template: 'assets/index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '*.json',
          context: path.resolve(__dirname, 'game-data'),
          to: path.resolve(__dirname, 'dist', 'data', 'game-data'),
        },
        {
          from: '*.*',
          context: path.resolve(__dirname, 'combatlog-data'),
          to: path.resolve(__dirname, 'dist', 'data', 'combatlog-data'),
        },
      ]
    }),
  ],
  devServer: {
    historyApiFallback: true
  }
};