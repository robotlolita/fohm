// This code was automatically generated from a grammar definition by Fohm.


module Lisp.Grammar

open Lisp.Syntax
open Fable.Core
open Fable.Core.JsInterop

module Lisp =
  [<Import("*", from="./fohm-runtime.js")>]
  let private makeParser (source: string, visitor: obj): obj = jsNative

  let private visitor = createObj [
    "Program_alt0" ==> fun meta forms ->
       List(forms) 
              
    "Expr_alt0" ==> fun meta _0 _1 id value _4 ->
       Define(id, value) 
              
    "Expr_alt1" ==> fun meta _0 _1 _2 ids _4 body _6 ->
       Lambda(ids, body) 
              
    "Expr_alt2" ==> fun meta _0 head args _3 ->
       Call(head, args) 
              
    "Expr_alt3" ==> fun meta id ->
       Symbol(id) 
              
    "Expr_alt4" ==> fun meta n ->
       Number(n) 
              
  ]

  type ParseResult<'T> =
    | Ok of 'T
    | Error of string

  // let parse (source: string): ParseResult<LispExpr> = 
  //   unbox makeParser(
  //     """
  //     Lisp {
  //       Program =
  //         | Expr* -- alt0
                
        
  //       Expr =
  //         | "(" "define" name Expr ")" -- alt0
  //         | "(" "lambda" "[" name* "]" Expr* ")" -- alt1
  //         | "(" Expr Expr* ")" -- alt2
  //         | name -- alt3
  //         | number -- alt4
                
        
  //       id =
  //         | letter alnum* -- alt0
                
        
  //       number =
  //         | digit+ -- alt0
                
  //     }
        
  //     """, 
  //     visitor
  //   )
  
