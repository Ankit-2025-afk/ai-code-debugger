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


@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code

    try:
        ast.parse(code)
        return {"status": "success", "message": "No syntax errors"}

    except SyntaxError as e:
        return {
            "status": "error",
            "error": str(e),
            "line": e.lineno
        }

