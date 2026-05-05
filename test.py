import google.generativeai as genai
import os

# Load API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# List models
models = genai.list_models()

for m in models:
    print(m.name, m.supported_generation_methods)