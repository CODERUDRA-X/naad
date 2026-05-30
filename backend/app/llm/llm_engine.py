import re
from openai import AsyncOpenAI
from app.core.config import NVIDIA_API_KEY, NVIDIA_MODEL

SYSTEM_PROMPT = """
You are a realtime conversational AI. Rules:
1. Every response chunk MUST begin with: [emotion: emotion_name]
2. Valid emotions: neutral, happy, serious, excited, thinking, sad
3. Keep chunks short. Never output markdown or JSON.
"""

client = AsyncOpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=NVIDIA_API_KEY)

async def stream_semantic_response(user_input: str):
    stream = await client.chat.completions.create(
        model=NVIDIA_MODEL, stream=True, temperature=0.4, max_tokens=300,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_input}]
    )
    
    buffer = ""
    # Split on natural pauses to stream phrase-by-phrase
    split_pattern = re.compile(r'([.,!?\n]+(?:\s+|$))')
    
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if not delta: continue
        buffer += delta
        
        match = split_pattern.search(buffer)
        while match:
            split_index = match.end()
            chunk_to_yield = buffer[:split_index]
            buffer = buffer[split_index:]
            
            if chunk_to_yield.strip():
                yield {"text": chunk_to_yield}
            match = split_pattern.search(buffer)

    if buffer.strip():
        yield {"text": buffer.strip()}