// This code was automatically generated from a grammar definition by Fohm.
module Fohm.Generated.Lisp =

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

type Meta = 
  { source: Position; children: Position list }



open Lisp.Syntax



open Fable.Core
open Fable.Core.JsInterop

[<Import("makeParser", from="./fohm-runtime.js")>]
let private makeParser (source: string, visitor: obj): obj = jsNative

let private visitor = 
  createObj [
    "Program_alt0" ==> fun (meta:Meta) forms ->
         List(unbox meta.source, forms) 
                
      "Expr_alt0" ==> fun (meta:Meta) _0 _1 id value _4 ->
         Define(unbox meta.source, id, value) 
                
      "Expr_alt1" ==> fun (meta:Meta) _0 _1 _2 ids _4 body _6 ->
         Lambda(unbox meta.source, ids, body) 
                
      "Expr_alt2" ==> fun (meta:Meta) _0 head args _3 ->
         Call(unbox meta.source, head, args) 
                
      "Expr_alt3" ==> fun (meta:Meta) id ->
         Symbol(unbox meta.source, id) 
                
      "Expr_alt4" ==> fun (meta:Meta) n ->
         Number(unbox meta.source, int n) 
                
  ]

let private primParser: obj  =
  makeParser(
    """
    Lisp {
        Program =
          | Expr* -- alt0
                
        
        Expr =
          | "(" "define" name Expr ")" -- alt0
          | "(" "lambda" "[" name* "]" Expr* ")" -- alt1
          | "(" Expr Expr* ")" -- alt2
          | name -- alt3
          | number -- alt4
                
        
        name =
          | letter alnum* -- alt0
                
        
        number =
          | digit+ -- alt0
                
      }
        
    """, 
    visitor
  )

let parse (source: string): Result<LispExpr, string> = 
  let (success, value) = !!(!!primParser)(source)
  if success then Ok(!!value)
  else Error(!!value)
  