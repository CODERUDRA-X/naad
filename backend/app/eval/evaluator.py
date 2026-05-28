from openai import AsyncOpenAI
from app.core.config import NVIDIA_API_KEY, NVIDIA_MODEL

client = AsyncOpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=NVIDIA_API_KEY)

EVALUATION_PROMPT = """
Evaluate the AI agent from 0-10 based on Interruption handling, Response continuity, Latency perception, and Semantic clarity.
Return ONLY:
Score: X/10
Reason: short explanation
"""

async def evaluate_conversation(transcript: str):
    try:
        response = await client.chat.completions.create(
            model=NVIDIA_MODEL, temperature=0.2, max_tokens=120,
            messages=[{"role": "system", "content": EVALUATION_PROMPT}, {"role": "user", "content": f"Transcript:\n\n{transcript}"}]
        )
        print("\n" + "="*50 + "\nCEKURA-STYLE EVALUATION\n" + "="*50)
        print(response.choices[0].message.content)
        print("="*50 + "\n")
    except Exception as e:
        print(f"Eval Error: {e}")