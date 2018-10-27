module LispProgram

open Lisp.Grammar
open Lisp.Syntax

let program = """
  (define one 1)
  (f (lambda [x y] (plus x y)) one)
"""

printfn "%A" (Lisp.parse program)