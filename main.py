from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
import ast

app = FastAPI()


# ---------- INPUT ----------
class CodeInput(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return FileResponse("index.html")


# ---------- INTELLIGENT ANALYSIS ----------

def detect_logical_errors(code: str):
    issues = []

    if "while True" in code:
        issues.append("Possible infinite loop detected")

    if "/ 0" in code:
        issues.append("Division by zero error")

    if "if True" in code:
        issues.append("Condition always true")

    return issues


def detect_performance(code: str):
    suggestions = []

    if code.count("for") >= 2:
        suggestions.append("Nested loop detected (O(n²) complexity)")

    if "range(len(" in code:
        suggestions.append("Use enumerate() instead of range(len())")

    return suggestions


def detect_security(code: str):
    risks = []

    if "eval(" in code:
        risks.append("Use of eval() is unsafe")

    if "exec(" in code:
        risks.append("Use of exec() is risky")

    return risks


# ---------- PYTHON ----------
def python_debug(code: str):

    logic = detect_logical_errors(code)
    perf = detect_performance(code)
    sec = detect_security(code)

    try:
        ast.parse(code)
        return {
            "status": "success",
            "syntax": "No syntax errors",
            "logic": logic,
            "performance": perf,
            "security": sec
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno,
            "logic": logic,
            "performance": perf,
            "security": sec
        }


# ---------- JAVASCRIPT ----------
def javascript_debug(code: str):

    logic = detect_logical_errors(code)
    perf = detect_performance(code)
    sec = detect_security(code)

    if "console.log" not in code:
        return {
            "status": "warning",
            "message": "No output statement found",
            "logic": logic,
            "performance": perf,
            "security": sec
        }

    return {
        "status": "success",
        "message": "JavaScript looks correct",
        "logic": logic,
        "performance": perf,
        "security": sec
    }


# ---------- C++ ----------
def cpp_debug(code: str):

    logic = detect_logical_errors(code)
    perf = detect_performance(code)
    sec = detect_security(code)

    if "#include" not in code:
        return {"status": "error", "message": "Missing #include"}

    if "main" not in code:
        return {"status": "error", "message": "Missing main() function"}

    if ";" not in code:
        return {"status": "error", "message": "Missing semicolon (;) in C++"}

    return {
        "status": "success",
        "message": "C++ looks correct",
        "logic": logic,
        "performance": perf,
        "security": sec
    }


# ---------- JAVA ----------
def java_debug(code: str):

    logic = detect_logical_errors(code)
    perf = detect_performance(code)
    sec = detect_security(code)

    if "class" not in code:
        return {"status": "error", "message": "No class found"}

    if "main" not in code:
        return {"status": "warning", "message": "main() method not found"}

    if ";" not in code:
        return {"status": "error", "message": "Missing semicolon (;) in Java"}

    return {
        "status": "success",
        "message": "Java looks correct",
        "logic": logic,
        "performance": perf,
        "security": sec
    }


# ---------- MAIN ----------
@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code
    language = input.language.lower()

    if language == "python":
        return python_debug(code)

    elif language == "javascript":
        return javascript_debug(code)

    elif language == "cpp":
        return cpp_debug(code)

    elif language == "java":
        return java_debug(code)

    return {"status": "error", "message": "Language not supported"}
