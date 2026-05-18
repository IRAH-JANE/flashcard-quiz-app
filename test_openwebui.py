import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENWEBUI_URL = os.getenv("OPENWEBUI_URL")
OPENWEBUI_MODEL = os.getenv("OPENWEBUI_MODEL")
OPENWEBUI_API_KEY = os.getenv("OPENWEBUI_API_KEY")

headers = {
    "Authorization": f"Bearer {OPENWEBUI_API_KEY}",
    "Content-Type": "application/json"
}

body = {
    "model": OPENWEBUI_MODEL,
    "messages": [
        {
            "role": "user",
            "content": "Return only JSON. Create 2 flashcards about prayer. Format: [{\"question\":\"...\",\"answer\":\"...\"}]"
        }
    ],
    "stream": False
}

response = requests.post(
    f"{OPENWEBUI_URL}/api/chat/completions",
    headers=headers,
    json=body,
    timeout=120
)

print("Status:", response.status_code)
print(response.text)