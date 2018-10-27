namespace Lisp.Syntax

type Offset = 
  { line: int; column: int }

type OffsetRecord<'a> =
  { start: 'a; ``end``: 'a }

type Position = 
  {
    offset: unit -> OffsetRecord<int>
    position: unit -> OffsetRecord<Offset>
    sourceSlice: string
  }

type LispExpr = 
  | List of pos: Position * exprs: LispExpr list
  | Define of pos: Position * name: string * value: LispExpr
  | Call of pos: Position * head: LispExpr * args: LispExpr list
  | Lambda of pos: Position * param: string list * body: LispExpr list
  | Symbol of pos: Position * name: string
  | Number of pos: Position * value: int
