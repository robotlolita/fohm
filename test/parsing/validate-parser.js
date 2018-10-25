const fs = require("fs");
const path = require("path");
const parser = require("../../source/parser");

const root = path.join(__dirname, "fixtures");
const files = fs.readdirSync(root).map(x => path.join(root, x));

function humanExpectation(x) {
  switch (x.toLowerCase()) {
    case "ok":
      return "should succeed";
    case "fail":
      return "should fail";
  }
}

describe("Parsing: validate", () => {
  for (const file of files) {
    const [expect, name] = path.basename(file, ".ohm").split("-");
    it(`${name} (${humanExpectation(expect)})`, () => {
      const source = fs.readFileSync(file, "utf8");
      parser.parse(source);
    });
  }
});
