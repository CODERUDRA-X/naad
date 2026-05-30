import { useEffect, useRef, useState } from "react"

export function useSemanticSocket({ onPacket }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  
  // 🛠️ UPGRADED: True Latency Simulator & Live Bandwidth Tracker
  const [latencyEnabled, setLatencyEnabled] = useState(false)
  const [totalBytes, setTotalBytes] = useState(0) 

  // Use Refs to stop React from infinite looping
  const onPacketRef = useRef(onPacket)
  const latencyRef = useRef(latencyEnabled)

  useEffect(() => {
    onPacketRef.current = onPacket
    latencyRef.current = latencyEnabled
  })

  useEffect(() => {
    // Connect ONLY ONCE!
    const socket = new WebSocket("ws://localhost:8000/ws/semantic")
    socketRef.current = socket

    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    
    socket.onmessage = (event) => {
  const packetSize = new Blob([event.data]).size
  setTotalBytes(prev => prev + packetSize)

  const packet = JSON.parse(event.data)
  // Record the exact millisecond when packet hit the laptop
  const receivedTime = performance.now()

  if (latencyRef.current) {
    console.log(`📥 Packet ${packet.seq} received at: ${receivedTime.toFixed(0)}ms`)
    
    setTimeout(() => {
      const processedTime = performance.now()
      const actualDelay = processedTime - receivedTime
      // Print the exact time difference (will be ~500ms)
      console.warn(`⏳ Packet ${packet.seq} processed after exactly: ${actualDelay.toFixed(0)}ms`)
      onPacketRef.current(packet)
    }, 500)
  } else {
    onPacketRef.current(packet)
  }
}

    return () => socket.close()
  }, []) 

  const sendMessage = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(text)
    }
  }

  // Passing the real metrics back to your UI
  return { connected, latencyEnabled, setLatencyEnabled, totalBytes, sendMessage }
}