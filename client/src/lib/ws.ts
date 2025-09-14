interface WebSocketMessage {
  type: string
  word_index?: number
  start_ms?: number
  end_ms?: number
  character?: string
}

export function connectWS(sessionId: string) {
  const ws = new WebSocket(`ws://localhost:8000/ws/${sessionId}`)
  
  const start = (text: string, rate: number, character?: string, voiceType?: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        text,
        rate,
        character,
        voice_type: voiceType || 'narrator'
      }))
    } else {
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({
          text,
          rate,
          character,
          voice_type: voiceType || 'narrator'
        }))
      })
    }
  }

  return { ws, start }
}

export function createWebSocketManager() {
  const connections = new Map<string, WebSocket>()
  
  const connect = (sessionId: string, url: string) => {
    if (connections.has(sessionId)) {
      connections.get(sessionId)?.close()
    }
    
    const ws = new WebSocket(url)
    connections.set(sessionId, ws)
    
    return ws
  }
  
  const disconnect = (sessionId: string) => {
    const ws = connections.get(sessionId)
    if (ws) {
      ws.close()
      connections.delete(sessionId)
    }
  }
  
  const send = (sessionId: string, message: WebSocketMessage) => {
    const ws = connections.get(sessionId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }
  
  const isConnected = (sessionId: string) => {
    const ws = connections.get(sessionId)
    return ws && ws.readyState === WebSocket.OPEN
  }
  
  return {
    connect,
    disconnect,
    send,
    isConnected,
    connections
  }
}

export const wsManager = createWebSocketManager()
