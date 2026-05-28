import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
import asyncio

async def test_llm():
    load_dotenv()
    key = os.getenv("NVIDIA_API_KEY")
    print(f"DEBUG: Key found: {key is not None}") # Dekh yahan True aata hai ya False
    
    client = AsyncOpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=key)
    try:
        completion = await client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[{"role": "user", "content": "Say hello"}]
        )
        print("SUCCESS! NVIDIA Responded:", completion.choices[0].message.content)
    except Exception as e:
        print("ERROR:", e)

asyncio.run(test_llm())