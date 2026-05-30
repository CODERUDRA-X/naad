import asyncio
import re
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask
from pipecat.processors.frame_processor import FrameProcessor
from pipecat.frames.frames import Frame, EndFrame

from app.llm.llm_engine import stream_semantic_response
from app.websocket.packetizer import SemanticPacketizer
from app.eval.evaluator import evaluate_conversation

router = APIRouter()

TAG_REGEX = re.compile(r"\[(?:emotion:\s*)?([a-zA-Z]+)\]", re.IGNORECASE)

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
            print(f"📦 DEBUG: Sending -> {frame.payload.get('text', '')}")
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
            pipecat_task = asyncio.create_task(runner.run(task))

            try:
                current_emotion = "neutral" 
                
                async for chunk in stream_semantic_response(user_input):
                    raw_text = chunk.get("text", "")
                    
                    # Update emotion state only if a new tag appears
                    matches = TAG_REGEX.findall(raw_text)
                    if matches:
                        current_emotion = matches[-1].lower()
                        
                    clean_text = TAG_REGEX.sub("", raw_text).strip()

                    if clean_text:
                        print(f"⚡ DEBUG: [{current_emotion}] {clean_text}")
                        transcript.append(f"AGENT: {clean_text}")
                        
                        packet = packetizer.create_packet(
                            text=clean_text, emotion=current_emotion, pace=1.0, interruptible=True, final=False
                        )
                        await task.queue_frame(SemanticFrame(packet.model_dump()))
                        
            except Exception as e:
                print(f"🚨 CRITICAL FAULT: Network/API failed -> {e}")
                error_packet = packetizer.create_packet(
                    text="System alert. Neural core connection disrupted.", 
                    emotion="sad", pace=1.0, interruptible=True, final=False
                )
                await task.queue_frame(SemanticFrame(error_packet.model_dump()))

            final_packet = packetizer.create_packet(text="", emotion="neutral", final=True)
            await task.queue_frame(SemanticFrame(final_packet.model_dump()))
            
            await task.queue_frame(EndFrame())
            await pipecat_task 
            print("🏁 DEBUG: Pipecat closed gracefully.")

    except WebSocketDisconnect:
        print("🛑 DEBUG: Client Disconnected!")
        full_transcript = "\n".join(transcript)
        if full_transcript.strip():
            await evaluate_conversation(full_transcript)