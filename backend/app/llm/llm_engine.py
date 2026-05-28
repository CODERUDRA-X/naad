# app/llm/llm_engine.py
from openai import AsyncOpenAI
from app.core.config import NVIDIA_API_KEY, NVIDIA_MODEL
from app.llm.parser import parse_semantic_chunk

SYSTEM_PROMPT = """
You are a realtime conversational AI. Rules:
1. Every response chunk MUST begin with: [emotion: emotion_name]
2. Valid emotions: neutral, happy, serious, excited, thinking
3. Keep chunks short. Never output markdown or JSON. Never explain formatting.
"""

client = AsyncOpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=NVIDIA_API_KEY)

async def stream_semantic_response(user_input: str):
    stream = await client.chat.completions.create(
        model=NVIDIA_MODEL, stream=True, temperature=0.4, max_tokens=300,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_input}]
    )
    buffer = ""
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if not delta: continue
        buffer += delta
        if "\n" not in buffer: continue
        
        lines = buffer.split("\n")
        buffer, complete_lines = lines[-1], lines[:-1]
        
        for line in complete_lines:
            cleaned = line.strip()
            if not cleaned: continue
            
            parsed = parse_semantic_chunk(cleaned)
            if parsed["text"]:
                print(f"DEBUG: LLM yielded: {parsed}") 
                yield parsed

    remaining = buffer.strip()
    if remaining:
        parsed = parse_semantic_chunk(remaining)
        if parsed["text"]: 
            yield parsed