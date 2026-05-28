
// src/renderer/WebSpeechRenderer.js

import { SpeechRenderer } from "./SpeechRenderer"

export class WebSpeechRenderer extends SpeechRenderer {

  async speak(packet) {

    return new Promise((resolve) => {

      const utterance = new SpeechSynthesisUtterance(packet.text)

      utterance.rate = packet.pace || 1

      utterance.onend = () => {
        resolve()
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  stop() {
    window.speechSynthesis.cancel()
  }
}
