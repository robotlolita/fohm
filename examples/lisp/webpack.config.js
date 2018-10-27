const path = require("path");

module.exports = {
  entry: "./build/Program.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "lisp.js"
  }
};
