namespace Lisp.Interpreter

open Lisp.Syntax

module LispInterpreter =
  type LispValue =
    | VNil
    | VNumber of int
    | VClosure of Env * param: string list * body: LispExpr list
    | VPrim of fn: (LispValue list -> LispValue)

  and Env(parent: Env option) =
    let mutable bindings: Map<string, LispValue> = Map.empty

    member __.Lookup (name: string) =
      match bindings.TryFind name with
        | Some(value) -> Some value
        | None -> match parent with
                    | Some(env) -> env.Lookup name
                    | None -> None

    member __.Define (name: string) (value: LispValue) : unit =
      bindings <- bindings.Add(name, value)

  let getPos (expr: LispExpr) =
    let pos = match expr with
              | List(p, _) -> p
              | Define(p, _, _) -> p
              | Call(p, _, _) -> p
              | Lambda(p, _, _) -> p
              | Symbol(p, _) -> p
              | Number(p, _) -> p
    let off = pos.position().start
    sprintf "line %i, column %i : %s" off.line off.column pos.sourceSlice

  let rec evalList (env: Env) (exprs: LispExpr list): LispValue =
    List.fold (fun st e -> evaluate env e) VNil exprs

  and evaluate (env: Env) (expr : LispExpr): LispValue =
    match expr with
      | List(_, exprs) -> evalList env exprs
      | Define(_, name, value) ->
          let value = evaluate env value
          env.Define name value |> ignore
          VNil
      | Call(_, head, args) ->
          let fn = evaluate env head
          let args = List.map (evaluate env) args
          match fn with
            | VClosure(cenv, param, body) ->
                let bodyEnv = Env(Some cenv)
                for (p, a) in List.zip param args do bodyEnv.Define p a
                evalList bodyEnv body
            | VPrim(fn) ->
                fn args
            | _ ->
                failwithf "Expected a closure, got %A.\nAt %s" fn (getPos expr)
      | Lambda(_, param, body) ->
          VClosure(env, param, body)
      | Symbol(_, name) ->
          match env.Lookup name with
            | Some(value) -> value
            | None -> failwithf "Undefined variable %A.\nAt %s" name (getPos expr)
      | Number(_, value) ->
          VNumber(value)

  let getNumber (value:LispValue) =
    match value with
    | VNumber(v) -> v
    | _ -> failwithf "Expected a number."

  let prim (fn:LispValue list -> LispValue) = VPrim(fn)
  let prim1 (fn:LispValue -> LispValue) = VPrim(fun ([a]) -> fn a)
  let prim2 (fn:LispValue -> LispValue -> LispValue) = VPrim(fun ([a; b]) -> fn a b)
  let asNum (x:int) = VNumber(x)

  let globalEnv() = 
    let env = Env(None)
    env.Define "add" <| prim2 (fun a b -> getNumber(a) + getNumber(b) |> asNum)
    env.Define "sub" <| prim2 (fun a b -> getNumber(a) - getNumber(b) |> asNum)
    env.Define "mul" <| prim2 (fun a b -> getNumber(a) * getNumber(b) |> asNum)
    env.Define "div" <| prim2 (fun a b -> getNumber(a) / getNumber(b) |> asNum)
    env.Define "print" <| prim1 (fun a -> printfn "%A" a; VNil)
    env


