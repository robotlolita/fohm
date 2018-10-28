# Fohm

Fohm is a PEG parser generator for Fable (meaning it'll only work with F# compiled to JavaScript using Fable. Sorry). It's based on the [Ohm](https://ohmlang.github.io/) library, which uses PEG and supports left-recursive rules.

Until I've the time to write proper documentation for this project, you can look at [Ohm's documentation](https://github.com/harc/ohm/blob/master/doc/index.md) for the parsing syntax and semantics. The two major differences is that Fohm allows providing a prelude for the generated code, and inlining semantic actions in the grammar. Each semantic action gets a special `meta` variable, which contains meta-information about the node.

## Getting started

Define a grammar using Fohm's extended Ohm syntax:

```
/*
namespace Arith.Syntax

type Expr =
  | Add of Expr * Expr
  | Sub of Expr * Expr
  | Num of int

*/

Arithmetic : Expr {
  Expr
    = l:Expr "+" r:Expr     --> /* Add(l, r) */
    | l:Expr "-" r:Expr     --> /* Sub(l, r) */
    | n:number              --> /* Num(int n) */
    | "(" e:Expr ")"        --> /* e */

  number
    = digit+
}
```

Compile it with Fohm (this will generate a `<name>.fs` and `fohm-runtime.js` file in the specified output directory):

```shell
$ fohm compile arithmetic.ohm --name Arith --outDir .
```

Use it in another module:

```
module Arith.Program

open Arith.Syntax

let eval (e:Expr) =
  match e with
  | Add(l, r) -> eval l + eval r
  | Sub(l, r) -> eval l - eval r
  | Num(n) -> n

match Arithmetic.parse "3 + (1 - 2) + 4" with
| Error(msg) -> failwithf "Failed to parse expression: %s" msg
| Ok(ast) -> printfn "3 + (1 - 2) + 4 = %i" (eval ast)
```

You can find complete examples in the `examples` folder.

## Why?

Ohm's design one major problem, in particular for static languages: **[Modular semantic actions](https://ohmlang.github.io/pubs/dls2016/modular-semantic-actions.pdf)**.

Ohm separates semantic actions from the grammar description. In a sense this makes grammars easier to read and more modular. It also helps with Ohm's concept of extensible grammars (particularly because it ties that to inheritance).

However, working with the parse trees become challenging. Because the semantic definition is separated from the grammar definition, the programmer needs to do more work to keep both in sync, and more work to define both. If one isn't going to use grammar inheritance or reuse the grammar in other languages, they only get the downsides.

Fohm solves this by merging semantic actions with the grammar definition again. It also provides an Ohm runtime that eases the conversion of concrete syntax trees (CST) into abstract syntax trees (AST), while making meta-information about the nodes available as well.

## Licence

Copyright (c) 2018 Quil. Licensed under MIT.
Ohm is (c) 2014-2018 Alessandro Warth and the Ohm project contributors.
