from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
import ast

app = FastAPI()


class CodeInput(BaseModel):
    code: str


@app.get("/")
def home():
    return FileResponse("index.html")


# -------- AUTO FIX FUNCTION --------
def auto_fix(code: str):

    lines = code.split("\n")
    fixed = []

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Fix missing colon
        if (stripped.startswith("for ") or stripped.startswith("if ") or stripped.startswith("while ") or stripped.startswith("def ")) and not stripped.endswith(":"):
            line = line + ":"

        # Fix indentation
        if i > 0:
            prev = lines[i - 1].strip()
            if prev.endswith(":") and not line.startswith("    "):
                line = "    " + stripped

        fixed.append(line)

    return "\n".join(fixed)


# -------- DEBUG FUNCTION --------
@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code

    try:
        ast.parse(code)

        return {
            "status": "success",
            "message": "No syntax errors"
        }

    except SyntaxError as e:

        fixed = auto_fix(code)

        return {
            "status": "error",
            "error": str(e),
            "line": e.lineno,
            "auto_fix": fixed
        }

