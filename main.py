from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import ast

app = FastAPI()

# =========================
# 🌐 CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 📥 INPUT MODEL
# =========================
class CodeInput(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return {"message": "Backend Running 🚀"}


# =========================
# 🧠 SIMPLE ANALYSIS
# =========================
def detect_issues(code: str):
    issues = []

    if "while True" in code:
        issues.append("⚠ Infinite loop detected")

    if "/ 0" in code:
        issues.append("⚠ Division by zero risk")

    return issues


# =========================
# 🐍 PYTHON DEBUG
# =========================
def python_debug(code: str):

    issues = detect_issues(code)

    try:
        # Syntax check
        ast.parse(code)

        # Runtime execution
        runtime_error = None
        try:
            exec(code, {})
        except Exception as e:
            runtime_error = str(e)

        return {
            "status": "success",
            "syntax": "No syntax errors",
            "runtime_error": runtime_error,
            "logic": issues,

            # 🔥 TEST FIELD (IMPORTANT)
            "test_message": "🔥🔥 BACKEND CHANGED SUCCESSFULLY 🔥🔥"

            # 🎯 CHANGE THIS TO TEST
            "ml_score": 88
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno,
            "logic": issues,

            # 🔥 TEST FIELD
            "test_message": "Syntax error triggered ⚠",

            "ml_score": 40
        }


# =========================
# 🚀 MAIN ROUTE
# =========================
@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code.strip()
    language = input.language.lower()

    if not code:
        return {"status": "error", "message": "Code cannot be empty"}

    if language == "python":
        return python_debug(code)

    return {
        "status": "success",
        "message": f"{language.upper()} analyzed",
        "test_message": "Non-python route working ✅",
        "ml_score": 70
    }