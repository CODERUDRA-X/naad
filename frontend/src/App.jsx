import { useCallback, useRef, useState } from "react"
import { useSemanticQueue } from "./hooks/useSemanticQueue"
import { useSemanticSocket } from "./hooks/useSemanticSocket"
import "./styles/app.css"
import SemanticGauge from './SemanticGauge';

export default function App() {
  const [packets, setPackets] = useState([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef(null)

  const { enqueuePacket, clearQueue, currentSeq } = useSemanticQueue()

  const handlePacket = useCallback((packet) => {
    if (packet.text) setPackets((prev) => [...prev, packet])
    if (packet.final) setIsProcessing(false)
    else enqueuePacket(packet)
  }, [enqueuePacket])

  const { connected, latencyEnabled, setLatencyEnabled, totalBytes, sendMessage } = useSemanticSocket({
    onPacket: handlePacket
  })

  const handleSend = () => {
    if (!input.trim() || isProcessing) return
    setIsProcessing(true) 
    clearQueue()
    sendMessage(input)
    setInput("")
  }

  const startVoiceRecognition = () => {
    if (isProcessing) return 
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognition) return alert("Speech recognition unsupported.")
    
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "en-US"
    recognition.interimResults = false 
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript.trim()) {
        setIsProcessing(true) 
        clearQueue()
        sendMessage(finalTranscript)
      }
    }
    recognition.start()
  }

  // 🧮 Explicit WebRTC Math
  const webRTCBytes = totalBytes * 120; 
  const isMB = webRTCBytes > 1048576;
  const webRTCDisplay = isMB ? (webRTCBytes / 1048576).toFixed(2) + " MB" : (webRTCBytes / 1024).toFixed(2) + " KB";

  return (
<div className="app">
      
      {/* 70% ENGINEERING / 30% PHILOSOPHY HYBRID */}
      
      {/* 📦 NAYA GROUP: Logo aur Buttons ko chipkane ke liye */}
      <div className="top-group">
        
        {/* LAYER 1 & 2: Branding (Image Logo) */}
        <header className="hero-header">
          <div className="brand">
            <img 
              src="https://github.com/CODERUDRA-X/naad/blob/main/IMG_20260613_171412.png?raw=true" 
              alt="NAAD - Streaming Meaning, Not Waveforms" 
              className="main-logo" 
              draggable="false"
            />
          </div>
        </header>

        <div className="ornate-divider">
        <div className="divider-line left"></div>
        <div className="divider-dot"></div>
        <div className="divider-line right"></div>
      </div>
      <p className="premium-tagline">Streaming Meaning, Not Waveforms.</p>

        {/* LAYER 3: Controls (Status Strip) */}
        <div className="status-strip">
          <div className="status-box">
            <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
            <span>{connected ? "CONNECTED" : "DISCONNECTED"}</span>
          </div>
          
          <button 
            className={`latency-btn ${latencyEnabled ? 'active' : ''}`}
            onClick={() => setLatencyEnabled(!latencyEnabled)}
          >
            {latencyEnabled ? '● Latency: 500ms' : '○ Latency: Realtime'}
          </button>
        </div>

      </div> 
      {/* 📦 GROUP KHATAM */}

      {/* MIDDLE: The Defensible Metrics (The Core Proof) */}
      <section className="metrics-panel">
        <div className="metric-card">
          <h3>Semantic Transport</h3>
          {/* THE METER IS BACK */}
          <SemanticGauge bytesReceived={totalBytes} />
          <p>Actual JSON payload footprint</p>
        </div>

        {/* CARD 3: Traditional Audio (Centered at Bottom) */}
        <div className="metric-card">
          <h3>Traditional Audio</h3>
          <div className="metric-value danger" title="Based on 32kbps Opus + RTP Overhead">
            {webRTCBytes === 0 ? "~1.8 MB" : `~${webRTCDisplay}`}
          </div>
          <p>Simulated WebRTC bandwidth overhead</p>
        </div>

        {/* CARD 2: Active Sequence (Right) */}
        <div className="metric-card">
          <h3>Active Sequence</h3>
          <div className="metric-value">#{currentSeq}</div>
          <p>Idempotent frame tracking</p>
        </div>
      </section>

      {/* BELOW: Flow of Consciousness (Visible Text Proof) */}
      <section className="river-section">
        <h2 className="river-title">Flow of Consciousness</h2>
        <div className="river-path">
          {packets.map((packet, idx) => (
            <div key={`${packet.seq}-${idx}`} className="parchment-chip">
              <div className="chip-header">#{packet.seq} • {packet.emotion || "Resonance"}</div>
              <div className="chip-text">{packet.text}</div>
            </div>
          ))}
          {packets.length === 0 && <p style={{opacity: 0.5, fontStyle: 'italic'}}>Awaiting resonance...</p>}
        </div>
      </section>

      {/* BOTTOM: Direct Input (Text + Voice combined) */}
      <section className="command-panel">
        <input
          className="command-input"
          type="text"
          placeholder={isProcessing ? "Processing intent..." : "Type your message manually..."}
          value={input}
          disabled={isProcessing || !connected}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
        />
        <button className="send-btn" onClick={handleSend} disabled={isProcessing || !connected}>
          {isProcessing ? "..." : "Send"}
        </button>
        <button 
          className={`ritual-mic ${isProcessing ? 'active-resonance' : ''}`} 
          onClick={startVoiceRecognition}
          disabled={isProcessing || !connected}
          title="Push to Talk"
        >
          {isProcessing ? '꩜' : '🎙'}
        </button>
      </section>

    </div>
  )
}