const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bib-parser.js',
    library: 'bibparser',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};