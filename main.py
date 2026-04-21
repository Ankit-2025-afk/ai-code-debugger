from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import ast
import subprocess
import tempfile
import google.generativeai as genai
from sklearn.linear_model import LinearRegression

# =========================
# 🔧 ENV SETUP
# =========================
load_dotenv()

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
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("⚠️ GEMINI_API_KEY not found")

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
# 🧠 ANALYSIS FUNCTIONS
# =========================
def detect_logical_errors(code: str):
    issues = []

    if "while True" in code:
        issues.append("Possible infinite loop detected")

    if "/ 0" in code:
        issues.append("Division by zero risk")

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


# =========================
# 📊 FEATURE EXTRACTION
# =========================
def extract_features(code: str):
    return [
        len(code.split("\n")),
        code.count("for"),
        code.count("while"),
        code.count("eval"),
        code.count("if"),
    ]


# =========================
# 🤖 SIMPLE ML MODEL
# =========================
X = [
    [5, 0, 0, 0, 1],
    [20, 2, 1, 1, 5],
    [50, 3, 2, 1, 10]
]

y = [95, 70, 50]

ml_model = LinearRegression()
ml_model.fit(X, y)


# =========================
# 🔒 SAFE CODE EXECUTION
# =========================
def safe_run_python(code: str):
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            filename = f.name

        result = subprocess.run(
            ["python", filename],
            capture_output=True,
            text=True,
            timeout=3
        )

        output = result.stdout or result.stderr
        return output if output else "Code executed (no output)"

    except Exception as e:
        return str(e)


# =========================
# 🤖 AI EXPLANATION
# =========================
def get_ai_explanation(code: str):

    if not API_KEY:
        return "AI not configured"

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-latest")

        prompt = f"""
        You are a senior software engineer.

        Analyze this code:
        - Explain what it does
        - Find bugs
        - Suggest improvements
        - Mention performance issues

        Code:
        {code}
        """

        response = model.generate_content(prompt)

        return response.text if response.text else "No AI response"

    except Exception as e:
        print("AI ERROR:", e)
        return "AI explanation not available"


# =========================
# 🐍 PYTHON DEBUG
# =========================
def python_debug(code: str):

    features = extract_features(code)
    ml_score = int(ml_model.predict([features])[0])
    ml_score = max(0, min(ml_score, 100))

    logic = detect_logical_errors(code)
    perf = detect_performance(code)
    sec = detect_security(code)
    explanation = get_ai_explanation(code)

    try:
        ast.parse(code)

        runtime_output = safe_run_python(code)

        return {
            "status": "success",
            "score": ml_score,

            "metrics": {
                "bugs": len(logic),
                "issues": len(perf),
                "security": len(sec)
            },

            "suggestions": [
                *logic,
                *perf,
                *sec
            ],

            "runtime_output": runtime_output,
            "ai_explanation": explanation
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "syntax_error": str(e),
            "line": e.lineno,

            "score": ml_score,

            "metrics": {
                "bugs": len(logic),
                "issues": len(perf),
                "security": len(sec)
            },

            "suggestions": [
                *logic,
                *perf,
                *sec
            ],

            "ai_explanation": explanation
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

    return {"status": "success", "message": f"{language} support coming soon"}