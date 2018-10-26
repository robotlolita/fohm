module Lisp.Syntax

type LispExpr = 
  | Define of name: string * value: LispExpr
  | Call of head: LispExpr * args: LispExpr list
  | Lambda of params: string list * body: LispExpr list
  | Symbol of name: string
  | Number of name: int
