from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
import subprocess
import tempfile
import ast
import os

app = FastAPI(title="AI Code Debugger")


class CodeInput(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return FileResponse("index.html")


# ---------- LANGUAGE HANDLERS ---------- #

def python_debug(code):
    try:
        ast.parse(code)
        return {"status": "success", "message": "No syntax errors"}
    except SyntaxError as e:
        return {
            "status": "error",
            "error": str(e),
            "line": e.lineno
        }


def javascript_debug(code):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".js") as f:
            f.write(code.encode())
            f.close()

            result = subprocess.run(
                ["node", f.name],
                capture_output=True,
                text=True
            )

        if result.stderr:
            return {"status": "error", "error": result.stderr}
        return {"status": "success", "output": result.stdout}

    except Exception as e:
        return {"status": "error", "error": str(e)}


def cpp_debug(code):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as f:
            f.write(code.encode())
            f.close()

            exe = f.name + ".exe"

            compile_res = subprocess.run(
                ["g++", f.name, "-o", exe],
                capture_output=True,
                text=True
            )

            if compile_res.stderr:
                return {"status": "error", "error": compile_res.stderr}

            run_res = subprocess.run(
                [exe],
                capture_output=True,
                text=True
            )

            return {"status": "success", "output": run_res.stdout}

    except Exception as e:
        return {"status": "error", "error": str(e)}


def java_debug(code):
    return {"status": "info", "message": "Java support coming soon"}


# ---------- MAIN ROUTE ---------- #

@app.post("/debug")
def debug_code(input: CodeInput):
    lang = input.language.lower()

    if lang == "python":
        return python_debug(input.code)

    elif lang == "javascript":
        return javascript_debug(input.code)

    elif lang == "cpp":
        return cpp_debug(input.code)

    elif lang == "java":
        return java_debug(input.code)

    return {"status": "error", "message": "Unsupported language"}
