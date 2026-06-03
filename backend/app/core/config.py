import os
from dotenv import load_dotenv

load_dotenv()

# Hum hardcode kar rahe hain taaki dependency hat jaye
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
# Fetch from .env or Render, use fallback if missing
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")

print(f"DEBUG: Using Model: {NVIDIA_MODEL}") # Yeh dekhne ke liye ki model load hua ya nahi