import requests
import json

OLLAMA_URL = "http://localhost:11434"

print("Testing Ollama models...")

models_response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=30)

print("Models status:", models_response.status_code)
print(models_response.text)

models_data = models_response.json()
models = models_data.get("models", [])

if not models:
    print("No models found in Ollama.")
    exit()

model_name = models[0]["name"]
print("Using model:", model_name)

prompt = """
Return only valid JSON.

Create 2 flashcards about prayer.

Format:
[
  {
    "question": "What is prayer?",
    "answer": "Prayer is..."
  }
]
"""

body = {
    "model": model_name,
    "prompt": prompt,
    "stream": False,
    "format": "json"
}

print("\nTesting Ollama generation...")

generate_response = requests.post(
    f"{OLLAMA_URL}/api/generate",
    json=body,
    timeout=180
)

print("Generate status:", generate_response.status_code)
print(generate_response.text)