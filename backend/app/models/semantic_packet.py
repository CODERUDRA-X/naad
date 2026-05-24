
# app/models/semantic_packet.py

from pydantic import BaseModel
from typing import Literal


class SemanticPacket(BaseModel):
    seq: int
    type: Literal["semantic"]
    
    text: str
    
    emotion: Literal[
        "neutral",
        "happy",
        "serious",
        "excited",
        "thinking"
    ]

    pace: float
    
    interruptible: bool
    
    final: bool
