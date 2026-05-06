from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import ast
import google.generativeai as genai

for model in genai.list_models():
    print(model.name)

# =====================================
# 🔑 GEMINI API KEY
# =====================================
# Replace with your NEW Gemini API key
genai.configure(api_key="AIzaSyArCt1RLzqUxVdG89UUF9tBBVenLe9pFjQ")

# =====================================
# 🚀 FASTAPI APP
# =====================================
app = FastAPI()

# =====================================
# 🌐 CORS
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# 📥 INPUT MODEL
# =====================================
class CodeInput(BaseModel):
    code: str
    language: str

# =====================================
# 🏠 HOME ROUTE
# =====================================
@app.get("/")
def home():
    return {"message": "Backend Running 🚀"}

# =====================================
# 🤖 GEMINI AI FUNCTION
# =====================================
def ai_review(code):
    try:
        model = genai.GenerativeModel("models/gemini-flash-lite-latest")

        prompt = f"""
You are an expert Python code reviewer.

Analyze this code and provide:
1. Bugs
2. Performance improvements
3. Security issues
4. Improved code

Code:
{code}
"""

        response = model.generate_content(prompt)

        return response.text if response.text else "No AI response"

    except Exception as e:
        print("Gemini Error:", e)
        return f"Gemini Error: {str(e)}"
# =====================================
# 🧠 DEBUG FUNCTION
# =====================================
def python_debug(code):
    logic = []
    performance_issues = []
    security_issues = []
    readability_issues = []
    best_practices_issues = []

    # -------- LOGIC --------
    if "while True" in code:
        logic.append("Possible infinite loop")

    # -------- PERFORMANCE --------
    if code.count("for") >= 2:
        performance_issues.append(
            "Nested loops detected → possible O(n²) complexity"
        )

    if "range(len(" in code:
        performance_issues.append(
            "Use direct iteration instead of range(len())"
        )

    # -------- SECURITY --------
    if "eval(" in code:
        security_issues.append("Avoid eval() → security risk")

    if "exec(" in code:
        security_issues.append("Avoid exec() → security risk")

    # -------- READABILITY --------
    if len(code.split("\n")) > 50:
        readability_issues.append(
            "Code too long → split into smaller functions"
        )

    if "x=" in code or "y=" in code:
        readability_issues.append(
            "Use meaningful variable names"
        )

    # -------- BEST PRACTICES --------
    if "def" in code and "->" not in code:
        best_practices_issues.append(
            "Use type hints in functions"
        )

    if "== True" in code:
        best_practices_issues.append(
            "Avoid == True, use direct condition"
        )

    # =====================================
    # ✅ SYNTAX CHECK
    # =====================================
    try:
        ast.parse(code)
        syntax_status = "No syntax errors"

        # =====================================
        # ✅ SAFE RUNTIME CHECK
        # =====================================
        runtime_error = None

        try:
            compiled_code = compile(code, "<string>", "exec")

            safe_builtins = {
                "print": print,
                "range": range,
                "len": len,
                "str": str,
                "int": int,
                "float": float,
                "list": list
            }

            exec(compiled_code, {"__builtins__": safe_builtins})

        except Exception as e:
            runtime_error = f"{type(e).__name__}: {str(e)}"

        # =====================================
        # 📊 METRICS
        # =====================================
        accuracy = 90 if not runtime_error else 60

        performance_score = max(
            50,
            90 - (len(performance_issues) * 10)
        )

        security_score = max(
            50,
            90 - (len(security_issues) * 10)
        )

        readability_score = max(
            50,
            90 - (len(readability_issues) * 10)
        )

        best_practices_score = max(
            50,
            90 - (len(best_practices_issues) * 10)
        )

        # =====================================
        # 📝 BASIC AI EXPLANATION
        # =====================================
        explanation = [
            f"Code has {len(code.splitlines())} lines",
            f"Detected {len(performance_issues)} performance issues",
            f"Detected {len(security_issues)} security issues",
            f"Detected {len(readability_issues)} readability issues"
        ]

        # =====================================
        # ✅ RESPONSE
        # =====================================
        return {
            "status": "success",
            "syntax": syntax_status,
            "runtime_error": runtime_error,
            "logic": logic,
            "performance": performance_issues,
            "security": security_issues,
            "readability": readability_issues,
            "best_practices": best_practices_issues,
            "metrics": {
                "accuracy": accuracy,
                "performance": performance_score,
                "readability": readability_score,
                "bestPractices": best_practices_score,
                "security": security_score
            },
            "ai_explanation": "\n".join(explanation)
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno
        }

# =====================================
# 🚀 API ROUTE
# =====================================
@app.post("/debug")
def debug_code(input: CodeInput):

    if input.language.lower() == "python":

        # Rule-based analysis
        result = python_debug(input.code)

        # Gemini AI response
        ai_feedback = ai_review(input.code)

        # Add AI response
        result["ai_suggestion"] = ai_feedback

        return result

    return {
        "message": "Only Python supported"
    }