
# app/main.py

from fastapi import FastAPI
from app.websocket.routes import router as websocket_router

app = FastAPI(
    title="Semantic Voice Transport Protocol"
)

app.include_router(websocket_router)


@app.get("/")
async def root():
    return {
        "status": "running",
        "protocol": "semantic-voice-v1"
    }
