from fastapi import FastAPI
from pydantic import BaseModel
import ast

app = FastAPI(title="AI Code Debugger")


class CodeInput(BaseModel):
    code: str


# Detect programming language
def detect_language(code: str):

    if "#include" in code:
        return "C++"

    if "console.log" in code or "function" in code:
        return "JavaScript"

    if "public class" in code or "System.out.println" in code:
        return "Java"

    if "def " in code or "print(" in code or "import " in code:
        return "Python"

    return "Unknown"


# Detect nested loops
def detect_nested_loops(code: str):
    if code.count("for") >= 2:
        return "Warning: Nested loop detected. Time complexity may be O(n²)."
    return None


# Detect unused variables
def detect_unused_variables(code: str):

    lines = code.split("\n")
    variables = []

    for line in lines:
        if "=" in line:
            var = line.split("=")[0].strip()
            variables.append(var)

    warnings = []

    for var in variables:
        if code.count(var) == 1:
            warnings.append(f"Variable '{var}' declared but not used")

    return warnings


# Suggest optimizations
def suggest_optimizations(code: str):

    suggestions = []

    if "range(len(" in code:
        suggestions.append(
            "Suggestion: Use enumerate() instead of range(len())."
        )

    if "== None" in code:
        suggestions.append(
            "Suggestion: Use 'is None' instead of '== None'."
        )

    return suggestions


# Attempt simple auto-fix
def auto_fix(code: str):

    lines = code.split("\n")
    fixed_lines = []

    for line in lines:

        stripped = line.strip()

        if stripped.startswith("for ") and not stripped.endswith(":"):
            line = line + ":"

        if stripped.startswith("if ") and not stripped.endswith(":"):
            line = line + ":"

        fixed_lines.append(line)

    return "\n".join(fixed_lines)


@app.get("/")
def home():
    return {"message": "AI Code Debugger running successfully"}


@app.post("/debug")
def debug_code(input: CodeInput):

    code = input.code
    language = detect_language(code)

    warning = detect_nested_loops(code)
    unused = detect_unused_variables(code)
    optimizations = suggest_optimizations(code)

    if language == "Python":

        try:
            ast.parse(code)

            return {
                "language": language,
                "status": "success",
                "message": "No syntax errors detected",
                "warning": warning,
                "unused_variables": unused,
                "optimization_suggestions": optimizations
            }

        except SyntaxError as e:

            corrected = auto_fix(code)

            suggestion = "Check missing ':' or indentation."

            if "expected ':'" in str(e):
                suggestion = "Missing ':' detected."

            return {
                "language": language,
                "status": "error",
                "error": str(e),
                "line": e.lineno,
                "suggestion": suggestion,
                "possible_fix": corrected
            }

    return {
        "language": language,
        "message": "Basic language detection only. Debugging support coming soon."
    }

