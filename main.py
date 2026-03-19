from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import ast

app = FastAPI()

# serve static files (HTML)
app.mount("/static", StaticFiles(directory="."), name="static")


class CodeInput(BaseModel):
    code: str


# Homepage → show index.html
@app.get("/")
def home():
    return FileResponse("index.html")


# Detect language
def detect_language(code: str):
    if "#include" in code:
        return "C++"
    if "console.log" in code or "function" in code:
        return "JavaScript"
    if "public class" in code:
        return "Java"
    if "def " in code or "print(" in code:
        return "Python"
    return "Unknown"


# Debug API
@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code
    language = detect_language(code)

    try:
        ast.parse(code)

        return {
            "status": "success",
            "language": language,
            "message": "No syntax errors detected"
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "error": str(e),
            "line": e.lineno
        }
