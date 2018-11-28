const Ohm = require("ohm-js");
const { toAST } = require("ohm-js/extras");
const fs = require("fs");
const path = require("path");

const grammarSource = fs.readFileSync(
  path.join(__dirname, "grammar.ohm"),
  "utf8"
);
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
    header: 0,
    prelude: 1,
    name: 2,
    resultType: 4,
    rules: 6
  },

  Header: {
    key: 1,
    value: 3
  },

  HeaderValue_text: {
    type: "text",
    value: 0
  },

  HeaderValue_qualified: {
    type: "name",
    value: 0
  },

  Rule(name, params, desc, op, alternatives) {
    return {
      type: "Rule",
      name: name.toAST(cstToAst),
      params: params.toAST(cstToAst),
      description: desc.toAST(cstToAst),
      operator: op.toAST(cstToAst),
      alternatives: alternatives
        .toAST(cstToAst)
        .map((x, i) => Object.assign(x, { index: i }))
    };
  },

  Description: 1,

  Formals: 1,
  Params: 1,

  Alternative: 1,

  Action_action: {
    type: "Action",
    body: 0,
    block: 2
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

  Iter_repeat0: {
    type: "Repeat0",
    rule: 0
  },

  Iter_repeat1: {
    type: "Repeat1",
    rule: 0
  },

  Iter_optional: {
    type: "Optional",
    rule: 0
  },

  Pred_lookahead: {
    type: "Lookahead",
    rule: 1
  },

  Pred_negation: {
    type: "Negation",
    rule: 1
  },

  Lex_lexify: {
    type: "Lexify",
    rule: 1
  },

  Base_apply: {
    type: "Apply",
    rule: 0,
    args: 1
  },

  Base_range: {
    type: "Range",
    start: 0,
    end: 2
  },

  Base_literal: {
    type: "Literal",
    value: 0
  },

  Base_group: {
    type: "Group",
    value: 1
  },

  String(value) {
    return JSON.parse(value.sourceString);
  },

  code(_1, text, _2) {
    return text.sourceString;
  }
};

// -- Exports ---------------------------------------------------------
module.exports = {
  grammar,
  parse,
  cstToAst
};
