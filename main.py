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
# 🔑 API KEY
# =========================
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
# 🧠 DEBUG FUNCTION
# =========================
def python_debug(code):
    logic = []
    performance = []
    security = []

    # -------- LOGIC --------
    if "while True" in code:
        logic.append("⚠ Possible infinite loop")

    # -------- PERFORMANCE --------
    if code.count("for") >= 2:
        performance.append("⚠ Nested loops → O(n²)")

    # -------- SECURITY --------
    if "eval(" in code:
        security.append("❌ eval() is unsafe")

    try:
        # -------- SYNTAX CHECK --------
        ast.parse(code)

        # -------- RUNTIME CHECK --------
        runtime_error = None
        try:
            compiled_code = compile(code, "<string>", "exec")
            exec(compiled_code, {"__builtins__": {}})
        except Exception as e:
            runtime_error = f"{type(e).__name__}: {str(e)}"

        # -------- AI ANALYSIS --------
        try:
            model = genai.GenerativeModel("models/gemini-flash-latest")

            prompt = f"""
Analyze this Python code:
- Explain what it does
- Find errors
- Suggest improvements

Code:
{code}
"""

            ai_response = model.generate_content(prompt)
            ai_text = ai_response.text if ai_response.text else "No AI response"

        except Exception as e:
            ai_text = f"AI failed: {str(e)}"

        # -------- RESPONSE --------
        return {
            "status": "success",
            "syntax": "No syntax errors",
            "runtime_error": runtime_error,
            "logic": logic,
            "performance": performance,
            "security": security,
            "scores": {
                "overall": 90 if not runtime_error else 60
            },
            "ai_explanation": ai_text
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno
        }


# =========================
# 🚀 API ROUTE
# =========================
@app.post("/debug")
def debug_code(input: CodeInput):
    if input.language.lower() == "python":
        return python_debug(input.code)

    return {"message": "Only Python supported"}