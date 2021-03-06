// This code was automatically generated from a grammar definition by Fohm.
module Fohm.Generated.Arithmetic

type Offset = 
  { line: int; column: int }

type OffsetRecord<'a> =
  { start: 'a; ``end``: 'a }

type Position = 
  {
    offset: unit -> OffsetRecord<int>
    position: unit -> OffsetRecord<Offset>
    sourceSlice: string
    sourceString: string
    filename: string option
  }

type Meta = 
  { source: Position; children: Position[] }

type ParseOptions =
  { filename: string option }



type Expr =
  | Add of Expr * Expr
  | Sub of Expr * Expr
  | Num of int



open Fable.Core
open Fable.Core.JsInterop

[<Import("makeParser", from="./fohm-runtime.js")>]
let private makeParser (source: string, visitor: obj): obj = jsNative

let private visitor = 
  createObj [
    "Expr_alt0" ==> fun (meta:Meta) l _1 r ->
       Add(l, r) 
              
    "Expr_alt1" ==> fun (meta:Meta) l _1 r ->
       Sub(l, r) 
              
    "Expr_alt2" ==> fun (meta:Meta) n ->
       Num(int n) 
              
    "Expr_alt3" ==> fun (meta:Meta) _0 e _2 ->
       e 
              
  ]

let private primParser: obj  =
  makeParser(
    """
    Arithmetic {
      Expr =
        | Expr "+" Expr -- alt0
        | Expr "-" Expr -- alt1
        | number -- alt2
        | "(" Expr ")" -- alt3
              
      
      number =
        | digit+ -- alt0
              
    }
      
    """, 
    visitor
  )

let parse (rule: string) (source: string) (options: ParseOptions): Result<Expr, string> = 
  let (success, value) = !!(primParser$(source, rule, options))
  if success then Ok(!!value)
  else Error(!!value)
  