#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { inspect } = require("util");
const fohm = require("../");

/**
 * Reads a file as a string.
 */
function read(file) {
  return fs.readFileSync(file, "utf8");
}

/**
 * Pretty-prints a data structure.
 */
function show(data) {
  return inspect(data, false, null, true);
}

// -- CLI --
require("yargs")
  .command("ast <file>", "shows the ast for <file>", {}, argv => {
    const program = read(argv.file);
    console.log(show(fohm.parse(program)));
  })
  .command("compile <file>", "compiles <file> to F#", {}, argv => {
    const program = read(argv.file);
    const ast = fohm.parse(program);
    console.log(fohm.generate(ast));
  })
  .help()
  .strict()
  .demandCommand(1).argv;
