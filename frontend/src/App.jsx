import { useCallback, useEffect, useRef, useState } from "react"
import { useSemanticQueue } from "./hooks/useSemanticQueue"
import { useSemanticSocket } from "./hooks/useSemanticSocket"
import "./styles/app.css"
import SemanticGauge from './SemanticGauge';

export default function App() {
  const [packets, setPackets] = useState([])
  const [input, setInput] = useState("")
  // 🛡️ THE FIX: UI Lock State
  const [isProcessing, setIsProcessing] = useState(false)
  
  const recognitionRef = useRef(null)

  const { enqueuePacket, clearQueue, currentSeq } = useSemanticQueue()

  const handlePacket = useCallback((packet) => {
    setPackets((prev) => [...prev, packet])
    
    // Unlock UI when the stream finally ends
    if (packet.final) {
      setIsProcessing(false)
    } else {
      enqueuePacket(packet)
    }
  }, [enqueuePacket])

  const { connected, latencyEnabled, setLatencyEnabled, totalBytes, sendMessage } = useSemanticSocket({
    onPacket: handlePacket
  })

  const handleSend = () => {
    if (!input.trim() || isProcessing) return
    setIsProcessing(true) // Lock UI
    clearQueue()
    sendMessage(input)
    setInput("")
  }

  const startVoiceRecognition = () => {
    if (isProcessing) return // Prevent mic if AI is speaking

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition unsupported in this browser.")
      return
    }
    
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "en-US"
    recognition.interimResults = false 
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript.trim() !== '') {
        setIsProcessing(true) // Lock UI
        clearQueue()
        sendMessage(finalTranscript)
      }
    }
    recognition.start()
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Semantic Voice Transport</h1>
          <p>Realtime Conversational Runtime</p>
        </div>
        <div className="controls">
          <div className="status-box">
            <span className={connected ? "status-dot connected" : "status-dot disconnected"} />
            <span>{connected ? "CONNECTED" : "DISCONNECTED"}</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={latencyEnabled}
              onChange={(e) => setLatencyEnabled(e.target.checked)}
            />
            <span>Simulate 500ms Latency</span>
          </label>
        </div>
      </header>

      <main className="dashboard">
        <section className="metrics-panel">
          <div className="metric-card">
            <h3>Semantic Protocol</h3>
            <div className="metric-value success">{(totalBytes / 1024).toFixed(2)} KB</div>
            <p>Live payload bytes received</p>
          </div>
          <div className="metric-card">
            <h3>Traditional Audio</h3>
            <div className="metric-value danger">~1.8 MB</div>
            <p>Standard WebRTC benchmark</p>
          </div>
          <div className="metric-card">
            <h3>Active Seq</h3>
            <div className="metric-value">#{currentSeq}</div>
            <p>Current playback frame</p>
          </div>
        </section>

        <section className="terminal-panel">
          <div className="terminal-header">Semantic Packet Telemetry</div>
          <div className="terminal-body">
            {packets.map((packet, idx) => (
              // Using idx as fallback key if seq is identical for STREAM_END
              <div key={`${packet.seq}-${idx}`} className="packet-row">
                <span className="seq">#{packet.seq}</span>
                <span className="emotion">[{packet.emotion}]</span>
                <span className="payload">{packet.text || "STREAM_END"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="command-panel">
          <input
            className="command-input"
            type="text"
            // Visual feedback when locked
            placeholder={isProcessing ? "AI is processing your request..." : "Talk to the AI Agent..."}
            value={input}
            disabled={isProcessing || !connected}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
          />
          {/* Disable buttons to prevent spam clicks */}
          <button className="send-btn" onClick={handleSend} disabled={isProcessing || !connected}>
            {isProcessing ? "Wait..." : "Send Text"}
          </button>
          <button className="voice-btn" onClick={startVoiceRecognition} disabled={isProcessing || !connected}>
            {isProcessing ? "Wait..." : "🎤 Push to Talk"}
          </button>
        </section>
      </main>
    </div>
  )
}