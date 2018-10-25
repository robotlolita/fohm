/**
 * Maps then flattens.
 *
 * @template T
 * @template U
 * @param {Array<T>} array
 * @param {(_: T) => Array<U>} mapping
 * @returns {Array<U>}
 */
function flatmap(array, mapping) {
  return array.map(mapping).reduce((a, b) => a.concat(b), []);
}

/**
 * Converts something to a F# string.
 *
 * @param {string} x
 */
function string(x) {
  return JSON.stringify(String(x));
}

/**
 * Ensures something is a valid F# identifier.
 *
 * @param {string} x
 */
function id(x) {
  if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(x)) {
    throw new Error(`Invalid identifier ${x}`);
  }
  return x;
}

/**
 * Fixes indentation on a code string.
 *
 * @param {string} x
 */
function code(x) {
  return x
    .trimLeft()
    .split(/\r\n|\r|\n/)
    .map(x => x.replace(/^\s*'\s?/, ""))
    .join("\n");
}

/**
 * Adds some indentation to all lines.
 *
 * @param {number} spaces
 * @param {string} x
 */
function indent(spaces, x) {
  const padding = " ".repeat(spaces);
  return x
    .split(/\r\n|\r|\n/)
    .map(line => `${padding}${line}`)
    .join("\n");
}

/**
 * Checks the type of a node.
 *
 * @param {string} type
 * @param {PegNode} node
 */
function checkType(type, node) {
  if (node.type !== type) {
    throw new Error(`Expected a ${type}, got ${node.type}`);
  }
}

/**
 * Generates a Fable module for the grammar.
 *
 * @param {PegGrammar} node
 */
function generate(node) {
  checkType("Grammar", node);

  return code(`
    ' // This code was automatically generated from a grammar definition by Fohm.
    ' // Instead of editing this file, edit the grammar definition and run Fohm again.
    '
    ' open Fable.Core.JsInterop
    ' module ${id(node.name)} =
    '   ${indent(2, node.prelude)}
    '
    '   [<Import("*", from="./fohm-runtime.js")>]
    '   let private makeParser (source: string, visitor: obj): obj = jsNative
    '
    '   let private visitor = createObj [
    '     ${indent(4, compileVisitor(node))}
    '   ]
    '
    '   type ParseResult<T> =
    '     Ok of T
    '     Error of string
    '
    '   let parse (source: string): ParseResult<${id(node.type)}> = 
    '     unbox makeParser(${string(compileGrammar(node))}, visitor)
  `);
}

/**
 * Generates Ohm grammar code.
 *
 * @param {PegGrammar} node
 */
function compileGrammar(node) {
  checkType("Grammar", node);

  return code(`
    ' ${id(node.name)} {
    '   ${indent(2, node.rules.map(compileOhm(node)).join("\n\n"))}
    ' }
  `);
}

/**
 * Generates code for Ohm rules.
 *
 * @param {PegGrammar} grammar
 * @param {PegNode} node
 */
function compileOhm(grammar) {
  function compile(node) {
    switch (node.type) {
      case "Rule": {
        const params = node.params ? `<${node.params.join(", ")}>` : "";
        const desc = node.description ? `(${node.description})` : "";
        return code(`
          ' ${node.name} ${params} ${desc} ${node.operator}
          '   ${indent(2, node.alternatives.map(compile).join("\n|"))}
        `);
      }

      case "Choice":
        return node.items.map(xs => xs.map(compile).join(" ")).join(" | ");

      case "Binding":
        return compile(node.rule);

      case "Action":
        return `${node.body.map(compile).join(" ")} -- alt${node.index}`;

      case "Repeat0":
        return `${compile(node.rule)}*`;

      case "Repeat1":
        return `${compile(node.rule)}+`;

      case "Optional":
        return `${compile(node.rule)}?`;

      case "Lookahead":
        return `&${compile(node.rule)}`;

      case "Negation":
        return `~${compile(node.rule)}`;

      case "Lexify":
        return `#${compile(node.rule)}`;

      case "Apply": {
        const args = node.args ? `<${node.args.join(", ")}>` : "";
        return `${node.rule}${args}`;
      }

      case "Range":
        return `${string(node.start)}..${string(node.end)}`;

      case "Literal":
        return `${string(node.value)}`;

      default:
        throw new Error(`Unknown node ${node.type}`);
    }
  }

  return compile;
}

/**
 * Compiles the action visitor for a grammar.
 *
 * @param {PegGrammar} grammar
 */
function compileVisitor(grammar) {
  checkType("Grammar", grammar);

  function compileAction(action) {
    throw new Error("TODO:");
  }

  return flatmap(grammar.rules, compileAction);
}
