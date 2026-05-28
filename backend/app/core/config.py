import os
from dotenv import load_dotenv

load_dotenv()

# Hum hardcode kar rahe hain taaki dependency hat jaye
NVIDIA_API_KEY = "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" 
NVIDIA_MODEL = "meta/llama-3.1-70b-instruct"

print(f"DEBUG: Using Model: {NVIDIA_MODEL}") # Yeh dekhne ke liye ki model load hua ya nahi