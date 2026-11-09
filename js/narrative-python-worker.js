var _=Object.freeze([{args:[80,60],expected:!0,label:"pode_ativar(80, 60) \u2192 True"},{args:[25,60],expected:!1,label:"pode_ativar(25, 60) \u2192 False"},{args:[60,60],expected:!0,label:"pode_ativar(60, 60) \u2192 True"},{args:[0,0],expected:!0,label:"Verifica\xE7\xE3o adicional: limite zero",hidden:!0},{args:[0,1],expected:!1,label:"Verifica\xE7\xE3o adicional: carga insuficiente",hidden:!0},{args:[42,12],expected:!0,label:"Verifica\xE7\xE3o adicional: carga suficiente",hidden:!0},{args:[59,60],expected:!1,label:"Verifica\xE7\xE3o adicional: abaixo do m\xEDnimo",hidden:!0},{args:[120,120],expected:!0,label:"Verifica\xE7\xE3o adicional: igualdade",hidden:!0}]),h=Object.freeze([{args:[72,"ALM-7"],expected:!0,label:"Press\xE3o suficiente e chave reconhecida"},{args:[69,"ALM-7"],expected:!1,label:"Press\xE3o abaixo do m\xEDnimo"},{args:[90,"ERRO"],expected:!1,label:"Chave n\xE3o reconhecida"},{args:[70,"ALM-7"],expected:!0,label:"Press\xE3o exatamente no limite"},{args:[0,"ALM-7"],expected:!1,hidden:!0},{args:[70,"alm-7"],expected:!1,hidden:!0},{args:[69,"ERRO"],expected:!1,hidden:!0},{args:[120,"ALM-7"],expected:!0,hidden:!0}]),y=Object.freeze([{args:[[{tipo:"historico",origem:"PAGEM"},{tipo:"logistica",origem:"ALAMUT"},{tipo:"historico",origem:"ARQUIVO NORTE"}]],expected:["PAGEM","ARQUIVO NORTE"],label:"Extrair somente registros hist\xF3ricos, na ordem"},{args:[[{tipo:"logistica",origem:"ALAMUT"}]],expected:[],label:"Sem registros hist\xF3ricos"},{args:[[]],expected:[],label:"Lista vazia"},{args:[[{tipo:"historico",origem:"PAGEM"},{tipo:"historico",origem:"PAGEM"}]],expected:["PAGEM","PAGEM"],label:"Preservar origens repetidas"},{args:[[{tipo:"historico",origem:"SUL"},{tipo:"logistica",origem:"PAGEM"},{tipo:"historico",origem:"NORTE"}]],expected:["SUL","NORTE"],hidden:!0},{args:[[{tipo:"Historico",origem:"PAGEM"},{tipo:"historico",origem:"LESTE"}]],expected:["LESTE"],hidden:!0},{args:[[{tipo:"logistica",origem:"SUL"},{tipo:"logistica",origem:"NORTE"}]],expected:[],hidden:!0}]),v=Object.freeze([{args:[[{id:"R03",tipo:"transcricao",fonte_primaria:null},{id:"R02",tipo:"original",fonte_primaria:null},{id:"R04",tipo:"transcricao",fonte_primaria:"ACERVO-12"},{id:"R01",tipo:"transcricao",fonte_primaria:""}]],expected:["R03","R01"],label:"Selecionar transcri\xE7\xF5es sem fonte e preservar a ordem"},{args:[[{id:"R02",tipo:"original",fonte_primaria:null},{id:"R04",tipo:"transcricao",fonte_primaria:"ACERVO-12"}]],expected:[],label:"Originais e transcri\xE7\xF5es com fonte ficam de fora"},{args:[[]],expected:[],label:"Lista vazia"},{args:[[{id:"R09",tipo:"transcricao",fonte_primaria:!1},{id:"R08",tipo:"transcricao",fonte_primaria:!0},{id:"R09",tipo:"transcricao",fonte_primaria:null}]],expected:["R09","R09"],label:"Preservar IDs repetidos e considerar o valor da fonte"},{args:[[{id:"H04",tipo:"Transcricao",fonte_primaria:null},{id:"H02",tipo:"transcricao",fonte_primaria:!1},{id:"H01",tipo:"original",fonte_primaria:!1}]],expected:["H02"],hidden:!0},{args:[[{id:"H07",tipo:"transcricao",fonte_primaria:"ORIGINAL-7"},{id:"H08",tipo:"original",fonte_primaria:null}]],expected:[],hidden:!0},{args:[[{id:"H12",tipo:"transcricao",fonte_primaria:""},{id:"H11",tipo:"transcricao",fonte_primaria:null},{id:"H12",tipo:"transcricao",fonte_primaria:!1}]],expected:["H12","H11","H12"],hidden:!0}]),b=Object.freeze([{args:[80,3],expected:!0,label:"Energia e varia\xE7\xE3o exatamente nos limites"},{args:[79,3],expected:!1,label:"Energia abaixo do m\xEDnimo"},{args:[100,4],expected:!1,label:"Varia\xE7\xE3o acima do m\xE1ximo"},{args:[90,1],expected:!0,label:"Reserva suficiente e campo est\xE1vel"},{args:[0,3],expected:!1,hidden:!0},{args:[1e3,0],expected:!0,hidden:!0},{args:[80,3.01],expected:!1,hidden:!0},{args:[79.9,0],expected:!1,hidden:!0}]),x=Object.freeze([{args:[],expected:["ancora","campo","retorno"],label:"Fixar a \xE2ncora, estabilizar o campo e preparar o retorno"}]),P=Object.freeze([{args:[[{id:"R03",declarado:48,encontrado:0},{id:"R02",declarado:0,encontrado:0},{id:"R01",declarado:0,encontrado:3}]],expected:["R03","R01"],label:"Comparar os dois campos e preservar a ordem"},{args:[[{id:"R04",declarado:7,encontrado:7},{id:"R05",declarado:0,encontrado:0}]],expected:[],label:"Registros iguais ficam de fora"},{args:[[]],expected:[],label:"Lista vazia"},{args:[[{id:"R09",declarado:2,encontrado:1},{id:"R08",declarado:-1,encontrado:-1},{id:"R09",declarado:1,encontrado:2}]],expected:["R09","R09"],label:"Preservar IDs repetidos em diverg\xEAncias de ambos os sentidos"},{args:[[{id:"H07",declarado:0,encontrado:0},{id:"H02",declarado:-2,encontrado:-3},{id:"H01",declarado:5,encontrado:5}]],expected:["H02"],hidden:!0},{args:[[{id:"H12",declarado:1.5,encontrado:1.5},{id:"H11",declarado:3,encontrado:3.01},{id:"H10",declarado:3.01,encontrado:3}]],expected:["H11","H10"],hidden:!0},{args:[[{id:"H22",declarado:1,encontrado:0},{id:"H21",declarado:0,encontrado:1},{id:"H22",declarado:2,encontrado:0}]],expected:["H22","H21","H22"],hidden:!0}]),u=["pode_ativar","acesso_liberado","origens_historicas","registros_suspeitos","campo_estavel","ordem_de_partida","divergencias"];function p(){let a="",e=0,r=!1;return{write(n){if(e>=200||a.length>=12e3){r=!0;return}let c=`${n}
`,d=12e3-a.length;a+=c.slice(0,d),e++,c.length>d&&(r=!0)},reset(){a="",e=0,r=!1},get value(){return a},get truncated(){return r}}}var m=`
import json as _campaign_json
import builtins as _campaign_builtins
import sys as _campaign_sys
import math as _campaign_math

def _campaign_error(error, fallback_line=None):
    kind = type(error).__name__
    line = getattr(error, "lineno", None)
    column = getattr(error, "offset", None)
    traceback = error.__traceback__
    while traceback is not None:
        if traceback.tb_frame.f_code.co_filename == "painel.py":
            line = traceback.tb_lineno
        traceback = traceback.tb_next
    if not line and type(fallback_line) is int:
        line = fallback_line
    if isinstance(error, IndentationError):
        message = "A indenta\xE7\xE3o desta linha est\xE1 incorreta. Use quatro espa\xE7os no corpo da fun\xE7\xE3o e mantenha o mesmo recuo no bloco."
    elif isinstance(error, SyntaxError):
        message = "Falta ':' ao final desta instru\xE7\xE3o." if "expected ':'" in str(error) else "H\xE1 um problema de sintaxe nesta linha. Confira os sinais e a estrutura da instru\xE7\xE3o."
    elif isinstance(error, NameError):
        name = str(getattr(error, "name", "") or "")[:80]
        message = ('O nome "' + name + '" n\xE3o foi definido. ' if name else "Um nome usado nesta linha n\xE3o foi definido. ") + "Confira a escrita e se a vari\xE1vel foi criada antes de us\xE1-la."
    elif isinstance(error, TypeError):
        message = "A opera\xE7\xE3o recebeu valores de tipos incompat\xEDveis. Confira a assinatura da fun\xE7\xE3o, os par\xE2metros e os tipos usados nesta linha."
    elif isinstance(error, ZeroDivisionError):
        message = "Uma divis\xE3o tentou usar zero como divisor. Confira o valor antes de dividir."
    elif isinstance(error, ImportError):
        message = "Este painel permite apenas m\xF3dulos de c\xE1lculo; rede e APIs do navegador est\xE3o indispon\xEDveis."
    elif isinstance(error, ValueError):
        message = "Um valor n\xE3o \xE9 v\xE1lido para esta opera\xE7\xE3o. Confira o conte\xFAdo usado nesta linha."
    elif isinstance(error, KeyError):
        message = "Um campo esperado n\xE3o est\xE1 neste registro. Confira os nomes tipo e origem e acesse cada registro da lista."
    elif isinstance(error, IndexError):
        message = "A posi\xE7\xE3o solicitada n\xE3o existe nesta lista. Confira seus limites ou percorra os itens com for."
    elif isinstance(error, RecursionError):
        message = "A fun\xE7\xE3o chamou a si mesma vezes demais. Confira a condi\xE7\xE3o que encerra a repeti\xE7\xE3o."
    else:
        message = "N\xE3o foi poss\xEDvel concluir esta instru\xE7\xE3o. Revise os valores e a l\xF3gica do programa."
    info = {"type": kind, "message": message}
    if type(line) is int and line > 0:
        info["line"] = line
    if type(column) is int and column > 0:
        info["column"] = column
    return info

def _campaign_error_text(info):
    return info["type"] + (" na linha " + str(info["line"]) if "line" in info else "") + ": " + info["message"]

def _campaign_diagnostics(info):
    if not info or "line" not in info:
        return []
    diagnostic = {"line": info["line"], "message": info["message"], "severity": "error"}
    if "column" in info:
        diagnostic["column"] = info["column"]
    return [diagnostic]

def _campaign_value(value, depth=0, include_lists=False):
    kind = type(value)
    if value is None or kind is bool:
        return value
    if kind is str:
        return value[:119] + "\u2026" if len(value) > 120 else value
    if kind is int:
        return value if abs(value) <= 9007199254740991 else "<inteiro grande>"
    if kind is float:
        return value if _campaign_math.isfinite(value) else "<n\xFAmero n\xE3o finito>"
    if include_lists and kind is list and depth < 3:
        return [_campaign_value(item, depth + 1, True) for item in value[:100]]
    names = {list: "lista", dict: "dicion\xE1rio", tuple: "tupla", set: "conjunto"}
    return "<" + names.get(kind, "valor de outro tipo") + ">"

class _CampaignSilentOutput:
    def write(self, text):
        return len(text)
    def flush(self):
        pass

def _campaign_validate(source, cases, trace_enabled=False, function_name="pode_ativar"):
    signatures = {
        "pode_ativar": "pode_ativar(disponivel, minimo)",
        "acesso_liberado": "acesso_liberado(pressao, chave)",
        "origens_historicas": "origens_historicas(registros)",
        "registros_suspeitos": "registros_suspeitos(registros)",
        "campo_estavel": "campo_estavel(energia, variacao)",
        "ordem_de_partida": "ordem_de_partida()",
        "divergencias": "divergencias(registros)",
    }
    if function_name not in signatures:
        return {"passed": False, "checks": [], "error": "A fun\xE7\xE3o solicitada n\xE3o pertence a este painel.", "diagnostics": [], "trace": [], "traceTruncated": False}
    original_import = _campaign_builtins.__import__
    allowed_modules = {"math", "operator", "functools", "itertools", "collections", "statistics", "decimal", "fractions", "random"}
    def limited_import(name, globals=None, locals=None, fromlist=(), level=0):
        if level or name.split(".")[0] not in allowed_modules:
            raise ImportError("Este painel permite apenas m\xF3dulos de c\xE1lculo; rede e APIs do navegador est\xE3o indispon\xEDveis.")
        return original_import(name, globals, locals, fromlist, level)
    safe_builtins = dict(vars(_campaign_builtins))
    safe_builtins["__import__"] = limited_import
    for name in ("open", "input", "breakpoint"):
        safe_builtins.pop(name, None)
    namespace = {"__builtins__": safe_builtins, "__name__": "__painel__"}
    try:
        exec(compile(source, "painel.py", "exec"), namespace, namespace)
    except BaseException as error:
        info = _campaign_error(error)
        return {"passed": False, "checks": [], "error": _campaign_error_text(info), "errorInfo": info, "diagnostics": _campaign_diagnostics(info), "trace": [], "traceTruncated": False}
    function = namespace.get(function_name)
    if not callable(function):
        return {"passed": False, "checks": [], "error": "Defina a fun\xE7\xE3o " + signatures[function_name] + " para testar o sistema.", "diagnostics": [], "trace": [], "traceTruncated": False}
    function_line = getattr(getattr(function, "__code__", None), "co_firstlineno", None)
    checks = []
    frames = []
    trace_truncated = False
    primary_error = None
    first_public = next((index for index, case in enumerate(cases) if not case.get("hidden", False)), None)
    def trace_step(frame, event, arg):
        nonlocal trace_truncated
        if frame.f_code.co_filename != "painel.py" or event not in ("line", "return", "exception"):
            return trace_step
        if len(frames) >= 120:
            trace_truncated = True
            _campaign_sys.settrace(None)
            return None
        variables = {}
        for name, value in frame.f_locals.items():
            if len(variables) >= 12:
                break
            if name.startswith("__") or type(value) not in (str, int, float, bool, type(None)):
                continue
            variables[name[:40]] = _campaign_value(value)
        step = {"line": frame.f_lineno, "event": event, "variables": variables}
        if event == "return":
            step["returnValue"] = _campaign_value(arg)
        frames.append(step)
        return trace_step
    hidden_index = 0
    for index, case in enumerate(cases):
        hidden = bool(case.get("hidden", False))
        if hidden:
            hidden_index += 1
        label = "Verifica\xE7\xE3o adicional " + str(hidden_index) if hidden else (case.get("label") or "Teste " + str(index + 1))
        check = {"label": label, "passed": False, "hidden": hidden}
        if not hidden:
            check.update({"input": case["args"], "expected": case["expected"], "actual": None})
        previous_trace = _campaign_sys.gettrace()
        previous_stdout, previous_stderr = _campaign_sys.stdout, _campaign_sys.stderr
        try:
            if hidden:
                _campaign_sys.stdout = _campaign_sys.stderr = _CampaignSilentOutput()
            if trace_enabled and index == first_public:
                _campaign_sys.settrace(trace_step)
            arguments = _campaign_json.loads(_campaign_json.dumps(case["args"]))
            actual = function(*arguments)
            is_list_result = function_name in ("origens_historicas", "registros_suspeitos", "ordem_de_partida", "divergencias")
            valid_type = type(actual) is list and all(type(item) is str for item in actual) if is_list_result else type(actual) is bool
            check["passed"] = valid_type and actual == case["expected"]
            if not hidden:
                check["actual"] = _campaign_value(actual, include_lists=is_list_result)
            if not check["passed"]:
                if hidden:
                    check["message"] = "O filtro ainda falha em outra lista. Preserve todas as condi\xE7\xF5es, a ordem e as repeti\xE7\xF5es." if is_list_result else "A regra ainda falha em outra combina\xE7\xE3o. Verifique tamb\xE9m os limites e todas as condi\xE7\xF5es."
                elif is_list_result and not valid_type:
                    if function_name == "ordem_de_partida":
                        check["message"] = "Retorne uma lista de tr\xEAs textos: ancora, campo e retorno. Tuplas, conjuntos e textos isolados n\xE3o representam a sequ\xEAncia pedida."
                    elif function_name == "divergencias":
                        check["message"] = "A fun\xE7\xE3o deve devolver uma lista de IDs em texto. Use [] quando declarado e encontrado forem iguais em todos os registros."
                    else:
                        check["message"] = "A fun\xE7\xE3o deve devolver uma lista de IDs em texto. Use [] quando n\xE3o houver registros suspeitos." if function_name == "registros_suspeitos" else "A fun\xE7\xE3o deve devolver uma lista de origens em texto. Use [] quando n\xE3o houver registros hist\xF3ricos."
                elif not is_list_result and type(actual) is not bool:
                    kinds = {type(None): "nenhum valor (None)", int: "um inteiro", float: "um n\xFAmero decimal", str: "um texto", list: "uma lista", dict: "um dicion\xE1rio", tuple: "uma tupla"}
                    check["message"] = "A fun\xE7\xE3o deve devolver True ou False; recebeu " + kinds.get(type(actual), "um valor de outro tipo") + "."
                elif function_name == "campo_estavel":
                    energia, variacao = case["args"]
                    if energia < 80:
                        check["message"] = "A energia est\xE1 abaixo de 80. O campo deve permanecer desligado, mesmo com varia\xE7\xE3o aceit\xE1vel."
                    elif variacao > 3:
                        check["message"] = "A varia\xE7\xE3o ultrapassa 3. A reserva suficiente, sozinha, n\xE3o estabiliza o campo."
                    else:
                        check["message"] = "Energia de pelo menos 80 e varia\xE7\xE3o de no m\xE1ximo 3 permitem energizar o campo. Inclua os dois limites."
                elif function_name == "ordem_de_partida":
                    if not actual or actual[0] != "ancora":
                        check["message"] = "\xC2NCORA N\xC3O FIXADA ANTES DO CAMPO. A primeira etapa deve ser ancora."
                    elif len(actual) < 3 or "retorno" not in actual:
                        check["message"] = "RETORNO N\xC3O PREPARADO. Inclua o retorno depois de estabilizar o campo."
                    elif len(actual) != 3 or actual[1] != "campo" or actual[2] != "retorno":
                        check["message"] = "A sequ\xEAncia precisa conter exatamente ancora, campo e retorno, nessa ordem, sem etapas extras."
                elif function_name == "acesso_liberado":
                    pressure, key = case["args"]
                    if pressure < 70:
                        check["message"] = "A press\xE3o est\xE1 abaixo de 70. O acesso deve permanecer bloqueado, mesmo com a chave correta."
                    elif key != "ALM-7":
                        check["message"] = "A chave n\xE3o \xE9 ALM-7. A press\xE3o suficiente, sozinha, n\xE3o libera a porta."
                    else:
                        check["message"] = "A press\xE3o \xE9 pelo menos 70 e a chave \xE9 ALM-7. As duas condi\xE7\xF5es permitem o acesso."
                elif function_name == "divergencias":
                    check["message"] = "Selecione os registros em que declarado != encontrado, nos dois sentidos. Retorne somente os IDs e preserve a ordem e as repeti\xE7\xF5es."
                elif is_list_result:
                    check["message"] = "Selecione somente transcri\xE7\xF5es sem fonte prim\xE1ria, retorne os IDs e preserve sua ordem e repeti\xE7\xF5es." if function_name == "registros_suspeitos" else "Confira o filtro tipo == historico, preserve a ordem e mantenha origens repetidas."
                else:
                    check["message"] = "Esperado " + str(case["expected"]) + "; recebido " + str(actual) + "."
        except BaseException as error:
            if hidden:
                check["message"] = "N\xE3o foi poss\xEDvel concluir uma verifica\xE7\xE3o adicional. Confira a regra e seus limites."
            else:
                info = _campaign_error(error, function_line)
                check["errorInfo"] = info
                check["message"] = _campaign_error_text(info)
                if primary_error is None:
                    primary_error = info
        finally:
            _campaign_sys.settrace(previous_trace)
            _campaign_sys.stdout, _campaign_sys.stderr = previous_stdout, previous_stderr
        checks.append(check)
    result = {"passed": bool(checks) and all(check["passed"] for check in checks), "checks": checks, "diagnostics": _campaign_diagnostics(primary_error), "trace": frames, "traceTruncated": trace_truncated}
    if primary_error:
        result["errorInfo"] = primary_error
        result["error"] = _campaign_error_text(primary_error)
    return result

_campaign_json.dumps(_campaign_validate(_campaign_source, _campaign_json.loads(_campaign_cases), globals().get("_campaign_trace_enabled", False), globals().get("_campaign_function_name", "pode_ativar")))
`;var t=self,s=t.postMessage.bind(t),o,l,i=p();function g(){let a=()=>{throw new Error("Acesso externo indispon\xEDvel neste painel local.")};for(let e of["fetch","XMLHttpRequest","WebSocket","EventSource","Worker","SharedWorker","importScripts","indexedDB","caches","BroadcastChannel","cookieStore","postMessage","close"])try{Object.defineProperty(t,e,{value:a,writable:!1,configurable:!1})}catch{}try{Object.defineProperty(t.navigator,"storage",{value:void 0,configurable:!1})}catch{}}async function f(){return l||(l=(async()=>{let a=new URL("../runtime/pyodide/pyodide.mjs",t.location.href).href,{loadPyodide:e}=await import(a);o=await e({indexURL:new URL("../runtime/pyodide/",t.location.href).href,stdLibURL:new URL("../runtime/pyodide/python_stdlib.data",t.location.href).href,stdout:r=>i.write(r),stderr:r=>i.write(r)}),g(),s({type:"ready"})})()),l}t.addEventListener("message",async a=>{let e=a.data;if(e?.type==="init"){try{await f()}catch{s({type:"error",error:"N\xE3o foi poss\xEDvel carregar o Python local. Confira sua conex\xE3o ou tente novamente."})}return}if(e?.type!=="run"||typeof e.code!="string"||!Array.isArray(e.tests))return;let r=e.functionName??"pode_ativar";if(!u.includes(r)){s({type:"result",id:e.id,result:{passed:!1,checks:[],stdout:"",error:"A fun\xE7\xE3o solicitada n\xE3o pertence a este painel."}});return}try{await f(),i.reset(),o.globals.set("_campaign_source",e.code),o.globals.set("_campaign_cases",JSON.stringify(e.tests)),o.globals.set("_campaign_trace_enabled",e.trace===!0),o.globals.set("_campaign_function_name",r);let n=await o.runPythonAsync(m),c={...JSON.parse(n),stdout:i.value,stdoutTruncated:i.truncated};s({type:"result",id:e.id,result:c})}catch{s({type:"result",id:e.id,result:{passed:!1,checks:[],stdout:i.value,stdoutTruncated:i.truncated,diagnostics:[],trace:[],error:"O executor n\xE3o conseguiu concluir o teste. Revise o c\xF3digo e execute novamente."}})}finally{for(let n of["_campaign_source","_campaign_cases","_campaign_trace_enabled","_campaign_function_name"])try{o?.globals.delete(n)}catch{}}});
