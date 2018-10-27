const DONT_INDENT_FIRST = false;

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
function indent(spaces, x, indentFirst = true) {
  const padding = " ".repeat(spaces);
  return x
    .split(/\r\n|\r|\n/)
    .map((line, i) => `${i !== 0 || indentFirst ? padding : ""}${line}`)
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
    '
    ' ${node.prelude}
    '
    ' open Fable.Core
    ' open Fable.Core.JsInterop
    '
    ' module ${id(node.name)} =
    '   [<Import("makeParser", from="./fohm-runtime.js")>]
    '   let private makeParser (source: string, visitor: obj): obj = jsNative
    '
    '   type Offset = 
    '     { line: int; column: int }
    '
    '   type OffsetRecord<'a> =
    '     { start: 'a; \`\`end\`\`: 'a }
    '
    '   type Position = 
    '     {
    '       offset: unit -> OffsetRecord<int>
    '       position: unit -> OffsetRecord<Offset>
    '       sourceSlice: string
    '     }
    '
    '   type Meta = 
    '     { source: Position; children: Position list }
    '
    '   let private visitor = 
    '     createObj [
    '       ${indent(6, compileVisitor(node), DONT_INDENT_FIRST)}
    '     ]
    '
    '   let private primParser: obj  =
    '     makeParser(
    '       """
    '       ${indent(6, compileGrammar(node), DONT_INDENT_FIRST)}
    '       """, 
    '       visitor
    '     )
    '
    '   let parse (source: string): Result<${id(node.resultType)}, string> = 
    '     let (success, value) = !!(!!primParser)(source)
    '     if success then Ok(!!value)
    '     else Error(!!value)
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
    '   ${indent(
      2,
      node.rules.map(compileOhm(node)).join("\n\n"),
      DONT_INDENT_FIRST
    )}
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
        const desc = node.description ? ` (${node.description})` : "";
        return code(`
          ' ${node.name}${params}${desc} ${node.operator}
          '   | ${indent(
            2,
            node.alternatives.map(compile).join("\n| "),
            DONT_INDENT_FIRST
          )}
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

  function compileAction(rule) {
    return flatmap(rule.alternatives, (x, i) => {
      if (x.block) {
        const names = x.body
          .filter(x => !["Negation", "Lookahead"].includes(x.type))
          .map((a, i) => (a.name ? a.name : `_${i}`))
          .join(" ");

        return [
          code(`
            ' ${string(`${rule.name}_alt${i}`)} ==> fun (meta:Meta) ${names} ->
            '   ${indent(2, x.block, DONT_INDENT_FIRST)}
          `)
        ];
      } else {
        return [];
      }
    });
  }

  return flatmap(grammar.rules, compileAction).join("\n");
}

module.exports = {
  generate,
  compileGrammar,
  compileOhm,
  compileVisitor
};
