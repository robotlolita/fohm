const path = require("path");

module.exports = {
  entry: "./src/Arith.fsproj",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "arithmetic.js"
  },
  module: {
    rules: [
      {
        test: /\.fs(x|proj)?/,
        use: "fable-loader"
      }
    ]
  }
};
