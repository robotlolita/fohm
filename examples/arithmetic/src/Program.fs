module Arith.Program

open Arith.Syntax

let rec eval (e: Expr) =
  match e with
  | Add(l, r) -> eval l + eval r
  | Sub(l, r) -> eval l - eval r
  | Num(n) -> n

match Arithmetic.parse "3 + (1 - 2) + 4" with
| Error(msg) -> failwithf "Failed to parse expression: %s" msg
| Ok(ast) -> printfn "3 + (1 - 2) + 4 = %i" (eval ast)