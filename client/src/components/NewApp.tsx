import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { connectWS } from '../lib/ws'
import { 
  Upload, Play, Pause, Volume2, BookOpen, Brain, Zap, 
  Settings, Palette, Type, Eye, EyeOff, Save, Download,
  Sun, Moon, Brightness, Contrast
} from 'lucide-react'

// Import our new components
import DocumentReader from './DocumentReader'
import FloatingVisualizationPanel from './FloatingVisualizationPanel'
import SettingsPanel from './SettingsPanel'
import NotesPanel from './NotesPanel'

export default function NewApp() {
  const fileRef = useRef<HTMLInputElement>(null)
  const {
    document,
    currentLine,
    isPlaying,
    isPaused,
    selectedVoice,
    selectedCharacter,
    settings,
    setDocument,
    setCurrentWord,
    setTimings,
    setPlaying,
    setPaused,
    setCurrentAudio,
    setReadingProgress,
    getCurrentLine,
    updateSettings,
  } = useStore()

  const [sessionId] = useState(`session_${Date.now()}`)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAutoReading, setIsAutoReading] = useState(false)
  const [currentImageGeneration, setCurrentImageGeneration] = useState<any>(null)
  const [notes, setNotes] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  // Auto-reading state
  const [autoReaderStatus, setAutoReaderStatus] = useState<any>(null)

  // Initialize reading progress
  useEffect(() => {
    if (document) {
      const totalLines = document.pages.reduce((total, page) => total + page.lines.length, 0)
      setReadingProgress({
        user_id: 'demo_user',
        document_id: `doc_${Date.now()}`,
        current_line: 0,
        total_lines: totalLines,
        reading_speed: settings.reading_speed,
        comprehension_score: 0.8,
        time_spent: 0,
        characters_encountered: document.characters,
      })
    }
  }, [document, settings.reading_speed, setReadingProgress])

  // Auto-reading WebSocket connection
  useEffect(() => {
    if (!document) return

    const ws = new WebSocket(`ws://localhost:8000/auto-reader/ws/${sessionId}`)
    
    ws.onopen = () => {
      console.log('Auto-reader WebSocket connected')
    }

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data)
      
      if (message.type === 'auto_reader_event') {
        const { event, data } = message
        
        switch (event) {
          case 'line_change':
            setAutoReaderStatus(prev => ({ ...prev, current_line: data.line_index }))
            break
          case 'audio_ready':
            setCurrentImageGeneration(null)
            // Play the audio
            if (data.audio_url) {
              playAudio(data.audio_url)
            }
            // Generate image for current line
            generateImageForLine(data.line)
            break
          case 'paused':
            setIsAutoReading(false)
            break
          case 'resumed':
            setIsAutoReading(true)
            break
          case 'stopped':
            setIsAutoReading(false)
            break
        }
      }
    }

    ws.onclose = () => {
      console.log('Auto-reader WebSocket disconnected')
    }

    return () => {
      ws.close()
    }
  }, [document, sessionId])

  async function onUpload(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('http://localhost:8000/documents', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const documentData = await response.json()
      setDocument(documentData)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  async function startAutoReading() {
    if (!document) return

    try {
      const response = await fetch('http://localhost:8000/auto-reader/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: document,
          start_line: 0,
          voice_settings: {
            voice_type: selectedVoice,
            rate: settings.reading_speed,
            character: selectedCharacter,
            voice_name: selectedVoice
          },
          auto_advance: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAutoReaderStatus(result)
        setIsAutoReading(true)
        console.log('Auto-reading started:', result)
      } else {
        const error = await response.text()
        console.error('Auto-reading start failed:', error)
      }
    } catch (error) {
      console.error('Auto-reading start error:', error)
    }
  }

  async function pauseAutoReading() {
    try {
      await fetch('http://localhost:8000/auto-reader/pause', { method: 'POST' })
      setIsAutoReading(false)
    } catch (error) {
      console.error('Pause error:', error)
    }
  }

  async function resumeAutoReading() {
    try {
      await fetch('http://localhost:8000/auto-reader/resume', { method: 'POST' })
      setIsAutoReading(true)
    } catch (error) {
      console.error('Resume error:', error)
    }
  }

  async function stopAutoReading() {
    try {
      await fetch('http://localhost:8000/auto-reader/stop', { method: 'POST' })
      setIsAutoReading(false)
      setAutoReaderStatus(null)
    } catch (error) {
      console.error('Stop error:', error)
    }
  }

  async function playAudio(audioUrl: string) {
    try {
      // Stop current audio if playing
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }

      // Create new audio element
      const newAudio = new Audio(`http://localhost:8000${audioUrl}`)
      setAudio(newAudio)
      
      newAudio.onloadeddata = () => {
        newAudio.play().catch(console.error)
      }
      
      newAudio.onended = () => {
        console.log('Audio finished playing')
      }
      
      newAudio.onerror = (e) => {
        console.error('Audio playback error:', e)
      }
    } catch (error) {
      console.error('Audio setup error:', error)
    }
  }

  async function generateImageForLine(line: any) {
    if (!line || !settings.show_visualizations) return

    try {
      const response = await fetch('http://localhost:8000/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_text: line.text,
          line_index: line.index,
          context: document?.genre,
          style: settings.visualization_style || 'cartoon'
        })
      })

      if (response.ok) {
        const imageData = await response.json()
        setCurrentImageGeneration(imageData)
      }
    } catch (error) {
      console.error('Image generation error:', error)
    }
  }

  function saveNotes() {
    // Save notes to localStorage or send to backend
    localStorage.setItem('reading_notes', notes)
  }

  function loadNotes() {
    const savedNotes = localStorage.getItem('reading_notes')
    if (savedNotes) {
      setNotes(savedNotes)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BrightMind</h1>
                <p className="text-sm text-gray-500">AI-Powered Reading Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Upload Button */}
              <div className="relative">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={onUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  <Upload size={16} />
                  {isUploading ? 'Uploading...' : 'Upload PDF'}
                </button>
              </div>

              {/* Auto-Reading Controls */}
              {document && (
                <div className="flex items-center gap-2">
                  {!isAutoReading ? (
                    <button
                      onClick={startAutoReading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
                    >
                      <Play size={16} />
                      Start Reading
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={pauseAutoReading}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 shadow-md"
                      >
                        <Pause size={16} />
                        Pause
                      </button>
                      <button
                        onClick={stopAutoReading}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
                      >
                        Stop
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showSettings ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings size={20} />
              </button>

              {/* Notes Button */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showNotes ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Save size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Left Panel - Floating Visualization */}
          <div className="col-span-3">
            <FloatingVisualizationPanel 
              currentImageGeneration={currentImageGeneration}
              isGenerating={false}
              line={getCurrentLine()}
            />
          </div>

          {/* Center Panel - Document Reader */}
          <div className="col-span-6">
            <DocumentReader 
              document={document}
              isAutoReading={isAutoReading}
              autoReaderStatus={autoReaderStatus}
            />
          </div>

          {/* Right Panel - Settings & Notes */}
          <div className="col-span-3 space-y-6">
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SettingsPanel 
                    settings={settings}
                    updateSettings={updateSettings}
                    selectedVoice={selectedVoice}
                    selectedCharacter={selectedCharacter}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <NotesPanel 
                    notes={notes}
                    setNotes={setNotes}
                    onSave={saveNotes}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      {document && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3 border border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>{document.genre || 'Document'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 size={16} />
              <span>{selectedVoice}</span>
            </div>
            {isAutoReading && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-reading</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
