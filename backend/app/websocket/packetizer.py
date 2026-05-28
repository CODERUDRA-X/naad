# app/websocket/packetizer.py

from app.models.semantic_packet import SemanticPacket


class SemanticPacketizer:

    def __init__(self):
        self.sequence = 0

    def create_packet(
        self,
        text: str,
        emotion: str = "neutral",
        pace: float = 1.0,
        interruptible: bool = True,
        final: bool = False
    ) -> SemanticPacket:

        packet = SemanticPacket(
            seq=self.sequence,
            type="semantic",
            text=text,
            emotion=emotion,
            pace=pace,
            interruptible=interruptible,
            final=final
        )

        self.sequence += 1

        return packet

