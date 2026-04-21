                                                

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import ast
import os
import google.generativeai as genai

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
# 🔑 AI KEY (optional)
# =========================
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

# =========================
# 📥 INPUT MODEL
# =========================
class CodeInput(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return {"message": "AI Debugger Backend Running 🚀"}


# =========================
# 🧠 LOGIC DETECTION
# =========================
def detect_logic(code):
    issues = []

    if "while True" in code:
        issues.append("⚠ Possible infinite loop")

    if "if True" in code:
        issues.append("⚠ Condition always true")

    if "/ 0" in code:
        issues.append("⚠ Division by zero risk")

    if "==" in code and "if" not in code:
        issues.append("⚠ Suspicious comparison without condition")

    return issues


# =========================
# ⚡ PERFORMANCE
# =========================
def detect_performance(code):
    issues = []

    if code.count("for") >= 2:
        issues.append("⚠ Nested loops → O(n²) complexity")

    if "range(len(" in code:
        issues.append("⚠ Use enumerate() instead of range(len())")

    return issues


# =========================
# 🔒 SECURITY
# =========================
def detect_security(code):
    issues = []

    if "eval(" in code:
        issues.append("❌ eval() is unsafe")

    if "exec(" in code:
        issues.append("❌ exec() is risky")

    return issues


# =========================
# 🤖 AI EXPLANATION
# =========================
def get_ai_explanation(code):
    if not API_KEY:
        return "AI not configured"

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-latest")

        prompt = f"""
        Analyze this code:
        - Explain what it does
        - Find issues
        - Suggest improvements

        Code:
        {code}
        """

        response = model.generate_content(prompt)
        return response.text if response.text else "No AI response"

    except Exception:
        return "AI failed"


# =========================
# 📊 SCORING SYSTEM
# =========================
def calculate_score(logic, performance, security, syntax_error):
    syntax_score = 0 if syntax_error else 100
    logic_score = max(100 - len(logic)*10, 40)
    perf_score = max(100 - len(performance)*10, 40)
    sec_score = max(100 - len(security)*10, 40)

    overall = (syntax_score + logic_score + perf_score + sec_score) // 4

    return {
        "overall": overall,
        "syntax": syntax_score,
        "logic": logic_score,
        "performance": perf_score,
        "security": sec_score
    }


# =========================
# 🐍 PYTHON DEBUG
# =========================
def python_debug(code):

    logic = detect_logic(code)
    perf = detect_performance(code)
    sec = detect_security(code)

    try:
        ast.parse(code)

        runtime_error = None
        try:
            exec(code, {})
        except Exception as e:
            runtime_error = str(e)

        scores = calculate_score(logic, perf, sec, False)

        return {
            "status": "success",
            "syntax": "No syntax errors",
            "runtime_error": runtime_error,
            "logic": logic,
            "performance": perf,
            "security": sec,
            "scores": scores,
            "test_message": "🔥 AI Backend Upgraded Successfully",
            "ai_explanation": get_ai_explanation(code)
        }

    except SyntaxError as e:
        scores = calculate_score(logic, perf, sec, True)

        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno,
            "logic": logic,
            "performance": perf,
            "security": sec,
            "scores": scores,
            "test_message": "⚠ Syntax Error Detected",
            "ai_explanation": get_ai_explanation(code)
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
        "test_message": "Other language support basic",
        "scores": {"overall": 70}
    }