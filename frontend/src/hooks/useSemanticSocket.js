import { useEffect, useRef, useState } from "react"

export function useSemanticSocket({ onPacket }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [packetLossEnabled, setPacketLossEnabled] = useState(false)

  // 🛠️ THE FIX: Use Refs to stop React from infinite looping
  const onPacketRef = useRef(onPacket)
  const packetLossRef = useRef(packetLossEnabled)

  useEffect(() => {
    onPacketRef.current = onPacket
    packetLossRef.current = packetLossEnabled
  })

  useEffect(() => {
    // Empty dependency array [] means connect ONLY ONCE!
    const socket = new WebSocket("ws://localhost:8000/ws/semantic")
    socketRef.current = socket

    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)

    socket.onmessage = (event) => {
      const packet = JSON.parse(event.data)
      
      if (packetLossRef.current && Math.random() < 0.5) {
        console.warn("Packet dropped:", packet.seq)
        return
      }
      onPacketRef.current(packet)
    }

    return () => socket.close()
  }, []) 

  const sendMessage = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(text)
    }
  }

  return { connected, packetLossEnabled, setPacketLossEnabled, sendMessage }
}