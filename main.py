from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
import ast

app = FastAPI()


class CodeInput(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return FileResponse("index.html")


# ---------- AUTO FIX ----------
def auto_fix(code: str):
    lines = code.split("\n")
    fixed = []

    for i, line in enumerate(lines):
        stripped = line.strip()

        if (stripped.startswith("for ") or stripped.startswith("if ") or stripped.startswith("while ") or stripped.startswith("def ")) and not stripped.endswith(":"):
            line = line + ":"

        if i > 0:
            prev = lines[i - 1].strip()
            if prev.endswith(":") and not line.startswith("    "):
                line = "    " + stripped

        fixed.append(line)

    return "\n".join(fixed)


# ---------- PYTHON DEBUG ----------
def python_debug(code: str):
    try:
        ast.parse(code)
        return {"status": "success", "message": "No syntax errors"}
    except SyntaxError as e:
        return {
            "status": "error",
            "error": str(e),
            "line": e.lineno,
            "auto_fix": auto_fix(code)
        }


# ---------- JAVASCRIPT DEBUG ----------
def javascript_debug(code: str):

    if not code.strip():
        return {"status": "error", "message": "Empty code"}

    if ";" not in code:
        return {
            "status": "warning",
            "message": "Missing semicolon (;) in JavaScript"
        }

    if "console.log" not in code:
        return {
            "status": "warning",
            "message": "No output statement found"
        }

    return {
        "status": "success",
        "message": "JavaScript looks correct"
    }


# ---------- C++ DEBUG ----------
def cpp_debug(code: str):

    if not code.strip():
        return {"status": "error", "message": "Empty code"}

    if "#include" not in code:
        return {
            "status": "error",
            "message": "Missing #include"
        }

    if "main" not in code:
        return {
            "status": "error",
            "message": "Missing main() function"
        }

    if ";" not in code:
        return {
            "status": "warning",
            "message": "Missing semicolon (;) in C++"
        }

    return {
        "status": "success",
        "message": "C++ looks correct"
    }


# ---------- JAVA DEBUG ----------
def java_debug(code: str):

    if not code.strip():
        return {"status": "error", "message": "Empty code"}

    if "class" not in code:
        return {
            "status": "error",
            "message": "No class found"
        }

    if "main" not in code:
        return {
            "status": "warning",
            "message": "main() method not found"
        }

    if "System.out.println" not in code:
        return {
            "status": "warning",
            "message": "No output statement found"
        }

    return {
        "status": "success",
        "message": "Java looks correct"
    }


# ---------- MAIN ROUTE ----------
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


