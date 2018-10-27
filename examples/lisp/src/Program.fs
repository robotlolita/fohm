module LispProgram

open Lisp.Grammar
open Lisp.Syntax
open Lisp.Interpreter

let program = """
  (define one 1)
  (define two 2)
  (define square (lambda [x] (mul x x)))

  (print (mul 3 (square (add one two))))
"""

match Lisp.parse program with
| Error(msg) ->
    failwithf "%s" msg
| Ok(expr) ->
    let env = LispInterpreter.globalEnv()
    let v = LispInterpreter.evaluate env expr
    printfn "--> %A" v