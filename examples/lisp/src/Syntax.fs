namespace Lisp.Syntax

type LispExpr = 
  | List of exprs: LispExpr list
  | Define of name: string * value: LispExpr
  | Call of head: LispExpr * args: LispExpr list
  | Lambda of param: string list * body: LispExpr list
  | Symbol of name: string
  | Number of name: int
