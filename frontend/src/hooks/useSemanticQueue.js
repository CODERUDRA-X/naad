
// src/hooks/useSemanticQueue.js

import { useEffect, useRef, useState } from "react"
import { WebSpeechRenderer } from "../renderer/WebSpeechRenderer"

export function useSemanticQueue() {

  const rendererRef = useRef(new WebSpeechRenderer())

  const queueRef = useRef([])

  const processingRef = useRef(false)

  const [currentSeq, setCurrentSeq] = useState(-1)

  // Insert packet in seq order
  const enqueuePacket = (packet) => {

    queueRef.current.push(packet)

    queueRef.current.sort((a, b) => a.seq - b.seq)

    processQueue()
  }

  // Sequential playback loop
  const processQueue = async () => {

    if (processingRef.current) return

    processingRef.current = true

    while (queueRef.current.length > 0) {

      const nextPacket = queueRef.current.shift()

      setCurrentSeq(nextPacket.seq)

      await rendererRef.current.speak(nextPacket)
    }

    processingRef.current = false
  }

  const clearQueue = () => {

    queueRef.current = []

    rendererRef.current.stop()
  }

  useEffect(() => {

    return () => {
      rendererRef.current.stop()
    }

  }, [])

  return {
    enqueuePacket,
    clearQueue,
    currentSeq
  }
}
