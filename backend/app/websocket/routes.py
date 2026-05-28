import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask
from pipecat.processors.frame_processor import FrameProcessor
# 🛠️ THE FIX: EndFrame import kiya gaya
from pipecat.frames.frames import Frame, EndFrame

from app.llm.llm_engine import stream_semantic_response
from app.websocket.packetizer import SemanticPacketizer
from app.eval.evaluator import evaluate_conversation

router = APIRouter()

class SemanticFrame(Frame):
    def __init__(self, payload: dict):
        super().__init__()
        self.payload = payload

class SemanticTransportProcessor(FrameProcessor):
    def __init__(self, websocket: WebSocket):
        super().__init__()
        self.websocket = websocket

    async def process_frame(self, frame, direction):
        await super().process_frame(frame, direction)
        
        if isinstance(frame, SemanticFrame):
            print(f"📦 DEBUG: Pipecat Router sending to Frontend -> {frame.payload.get('text', '')}")
            await self.websocket.send_json(frame.payload)
            
        await self.push_frame(frame, direction)

@router.websocket("/ws/semantic")
async def semantic_socket(websocket: WebSocket):
    await websocket.accept()
    print("🚀 DEBUG: Client Connected to WebSocket!")
    
    packetizer = SemanticPacketizer()
    transport = SemanticTransportProcessor(websocket)
    transcript = []

    try:
        while True:
            user_input = await websocket.receive_text()
            print(f"🟢 DEBUG: Received from User: {user_input}")
            transcript.append(f"USER: {user_input}")
            
            pipeline = Pipeline([transport])
            task = PipelineTask(pipeline)
            runner = PipelineRunner()
            
            # Start Pipecat task
            pipecat_task = asyncio.create_task(runner.run(task))

            async for chunk in stream_semantic_response(user_input):
                print(f"⚡ DEBUG: LLM generated: {chunk['text']}")
                transcript.append(f"AGENT: {chunk['text']}")
                
                packet = packetizer.create_packet(
                    text=chunk["text"], emotion=chunk["emotion"], pace=1.0, interruptible=True, final=False
                )
                await task.queue_frame(SemanticFrame(packet.model_dump()))

            final_packet = packetizer.create_packet(text="", emotion="neutral", final=True)
            await task.queue_frame(SemanticFrame(final_packet.model_dump()))
            
            # 🏆 THE GOLDEN FIX: 
            # Pipecat ko gracefully band hone ko kaho (EndFrame) aur uska wait karo
            await task.queue_frame(EndFrame())
            await pipecat_task 
            print("🏁 DEBUG: Pipecat successfully delivered everything and closed gracefully.")

    except WebSocketDisconnect:
        print("🛑 DEBUG: Client Disconnected!")
        full_transcript = "\n".join(transcript)
        if full_transcript.strip():
            await evaluate_conversation(full_transcript)