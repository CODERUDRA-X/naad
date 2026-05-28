
# app/websocket/mock_stream.py

import asyncio
from typing import AsyncGenerator


async def mock_llm_stream() -> AsyncGenerator[str, None]:
    
    chunks = [
        "Hello.",
        " This is a resilient",
        " semantic voice transport",
        " protocol demo.",
        " Even with packet loss,",
        " the conversation survives."
    ]

    for chunk in chunks:
        await asyncio.sleep(0.7)
        yield chunk
