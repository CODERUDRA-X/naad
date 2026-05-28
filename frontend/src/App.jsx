import { useCallback, useRef, useState } from "react"
import { useSemanticQueue } from "./hooks/useSemanticQueue"
import { useSemanticSocket } from "./hooks/useSemanticSocket"
import "./styles/app.css"

export default function App() {
  const [packets, setPackets] = useState([])
  const [input, setInput] = useState("")
  const recognitionRef = useRef(null)

  const { enqueuePacket, clearQueue, currentSeq } = useSemanticQueue()

  const handlePacket = useCallback((packet) => {
    setPackets((prev) => [...prev, packet])
    if (!packet.final) {
      enqueuePacket(packet)
    }
  }, [enqueuePacket])

  const { connected, packetLossEnabled, setPacketLossEnabled, sendMessage } = useSemanticSocket({
    onPacket: handlePacket
  })

  // 🛠️ Handle sending text to the LLM backend
  const handleSend = () => {
    if (!input.trim()) return
    clearQueue()
    sendMessage(input)
    setInput("")
  }

  // 🎙️ Handle native browser speech-to-text
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition unsupported in this browser.")
      return
    }
    
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "en-US"
    // 🛠️ BUG FIX: Interim results disable kiye hain, par loop me bhi validation chahiye
    recognition.interimResults = false 
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      // 🛠️ BUG FIX: Sirf FINAL text ko filter karo, adhoore words ko nahi
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript.trim() !== '') {
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
              checked={packetLossEnabled}
              onChange={(e) => setPacketLossEnabled(e.target.checked)}
            />
            <span>Simulate 50% Packet Loss</span>
          </label>
        </div>
      </header>

      <main className="dashboard">
        <section className="metrics-panel">
          <div className="metric-card">
            <h3>Semantic Protocol</h3>
            <div className="metric-value success">~40KB</div>
            <p>Semantic frame transport</p>
          </div>
          <div className="metric-card">
            <h3>Traditional Audio</h3>
            <div className="metric-value danger">~1.8MB</div>
            <p>Continuous audio transport</p>
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
            {packets.map((packet) => (
              <div key={packet.seq} className="packet-row">
                <span className="seq">#{packet.seq}</span>
                <span className="emotion">[{packet.emotion}]</span>
                <span className="payload">{packet.text || "STREAM_END"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 THE MISSING COMMAND PANEL */}
        <section className="command-panel">
          <input
            className="command-input"
            type="text"
            placeholder="Talk to the AI Agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
          />
          <button className="send-btn" onClick={handleSend}>Send Text</button>
          <button className="voice-btn" onClick={startVoiceRecognition}>🎤 Push to Talk</button>
        </section>
      </main>
    </div>
  )
}