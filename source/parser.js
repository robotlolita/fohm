const Ohm = require("ohm-js");
const toAST = require("ohm-js/extras");
const fs = require("fs");
const path = require("path");

const grammarSource = fs.readFileSync(path.join(__dirname, "grammar.ohm"));
const grammar = Ohm.grammar(grammarSource);

/**
 * Parses some Fohm source code into an AST.
 *
 * @param {string} source
 * @throws {SyntaxError} if the source can't be parsed.
 */
function parse(source) {
  const result = grammar.match(source);
  if (result.failed()) {
    throw new SyntaxError(result.message);
  }

  return toAST(result, cstToAst);
}

/**
 * A mapping for Ohm's toAST extension that converts Ohm's
 * CST into a more manageable AST.
 */
const cstToAst = {
  Grammar: {
    type: "Grammar",
    prelude: 0,
    name: 1,
    rules: 3
  },

  Rule: {
    type: "Rule",
    name: 0,
    params: 1,
    description: 2,
    operator: 3,
    alternatives: 4
  },

  Description: 1,

  Params: 1,

  Action_action: {
    type: "Action",
    body: 0,
    block: 1
  },

  Action_no_action: {
    type: "Action",
    body: 0,
    block: ""
  },

  Choice_choice: {
    type: "Choice",
    alternatives: 0
  },

  Binding_named: {
    type: "Binding",
    name: 0,
    rule: 2
  },

  Expr_repeat0: {
    type: "Repeat0",
    rule: 0
  },

  Expr_repeat1: {
    type: "Repeat1",
    rule: 0
  },

  Expr_optional: {
    type: "Optional",
    rule: 0
  },

  Expr_lookahead: {
    type: "Lookahead",
    rule: 1
  },

  Expr_negation: {
    type: "Negation",
    rule: 1
  },

  Expr_lexify: {
    type: "Lexify",
    rule: 1
  },

  Term_apply: {
    type: "Apply",
    rule: 0,
    args: 2
  },

  Term_name: {
    type: "Named",
    rule: 0
  },

  Term_range: {
    type: "Range",
    start: 0,
    end: 2
  },

  Term_literal: {
    type: "Literal",
    value: 0
  },

  Term_group: 1,

  code: 1
};

// -- Exports ---------------------------------------------------------
module.exports = {
  grammar,
  parse,
  cstToAst
};
