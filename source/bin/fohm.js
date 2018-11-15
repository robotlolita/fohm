#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
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

/**
 * The path to the runtime file.
 */
const runtimePath = path.join(__dirname, "../../runtime/fohm-runtime.js");

// -- CLI --
require("yargs")
  .command("ast <file>", "shows the ast for <file>", {}, argv => {
    const program = read(argv.file);
    console.log(show(fohm.parse(program)));
  })
  .command(
    "compile <file>",
    "compiles <file> to F#",
    {
      name: {
        description: "The name of the file to generate.",
        required: true
      },
      outDir: {
        description: "The directory to place the generated files.",
        required: true
      }
    },
    argv => {
      const program = read(argv.file);

      console.info(`-> Compiling ${argv.file}`);
      mkdirp.sync(argv.outDir);
      const ast = fohm.parse(program);
      fs.writeFileSync(
        path.join(argv.outDir, argv.name + ".fs"),
        fohm.generate(ast)
      );

      console.info(`-> Copying Fohm's runtime to ${argv.outDir}`);
      fs.copyFileSync(runtimePath, path.join(argv.outDir, "fohm-runtime.js"));
    }
  )
  .help()
  .strict()
  .demandCommand(1).argv;
