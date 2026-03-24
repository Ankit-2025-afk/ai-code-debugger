from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import ast
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ API key
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("⚠️ No API key found")


# ---------- INPUT ----------
class CodeInput(BaseModel):
    code: str
    language: str


@app.get("/")
def home():
    return {"message": "AI Debugger Backend Running"}


# ---------- ANALYSIS ----------
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


# ---------- AI ----------
def get_ai_explanation(code: str):

    if not API_KEY:
        return "AI key not configured"

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"Explain this code and find issues:\n{code}"

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:
        print("AI ERROR:", e)
        return "AI explanation not available"


# ---------- PYTHON ----------
def python_debug(code: str):

    logic = detect_logical_errors(code)
    perf = detect_performance(code)
    sec = detect_security(code)
    explanation = get_ai_explanation(code)

    try:
        ast.parse(code)

        return {
            "status": "success",
            "syntax": "No syntax errors",
            "logic": logic,
            "performance": perf,
            "security": sec,
            "ai_explanation": explanation
        }

    except SyntaxError as e:

        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno,
            "logic": logic,
            "performance": perf,
            "security": sec,
            "ai_explanation": explanation
        }


# ---------- OTHER LANGUAGES ----------
def generic_debug(code: str, lang: str):
    return {
        "status": "success",
        "message": f"{lang} analyzed",
        "logic": detect_logical_errors(code),
        "performance": detect_performance(code),
        "security": detect_security(code),
        "ai_explanation": get_ai_explanation(code)
    }


# ---------- MAIN ----------
@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code
    language = input.language.lower()

    if language == "python":
        return python_debug(code)

    return generic_debug(code, language)