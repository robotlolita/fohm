module Arith.Program

open Fohm.Generated.Arithmetic

let tryParse source = parse "Expr" source { filename = None }

let rec eval (e: Expr) =
  match e with
  | Add(l, r) -> eval l + eval r
  | Sub(l, r) -> eval l - eval r
  | Num(n) -> n

match tryParse "3 + (1 - 2) + 4" with
| Error(msg) -> failwithf "Failed to parse expression: %s" msg
| Ok(ast) -> printfn "3 + (1 - 2) + 4 = %i" (eval ast)