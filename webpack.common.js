const path = require('path');

module.exports = {
  entry: {
    app: './js/game.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/game.js',
  },
};
