import os
from dotenv import load_dotenv

load_dotenv()

# Hum hardcode kar rahe hain taaki dependency hat jaye
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct"

print(f"DEBUG: Using Model: {NVIDIA_MODEL}") # Yeh dekhne ke liye ki model load hua ya nahi