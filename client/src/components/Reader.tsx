import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { Play, Pause, SkipForward, SkipBack, Volume2, Eye, EyeOff } from 'lucide-react'

interface ReaderProps {
  className?: string
}

export default function Reader({ className = '' }: ReaderProps) {
  const {
    document,
    currentPage,
    currentLine,
    currentWord,
    isPlaying,
    isPaused,
    settings,
    focusMode,
    getCurrentPage,
    getCurrentLine,
    setCurrentLine,
    setCurrentWord,
    setPlaying,
    setPaused,
    setFocusMode,
  } = useStore()

  const readerRef = useRef<HTMLDivElement>(null)

  const currentPageData = getCurrentPage()
  const currentLineData = getCurrentLine()

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentPageData) return

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          if (currentLine < currentPageData.lines.length - 1) {
            setCurrentLine(currentLine + 1)
          }
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          if (currentLine > 0) {
            setCurrentLine(currentLine - 1)
          }
          break
        case ' ':
          e.preventDefault()
          if (isPlaying) {
            setPaused(!isPaused)
          } else {
            setPlaying(true)
          }
          break
        case 'f':
          e.preventDefault()
          setFocusMode(!focusMode)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentLine, currentPageData, isPlaying, isPaused, focusMode, setCurrentLine, setPlaying, setPaused, setFocusMode])

  if (!document || !currentPageData) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Document Loaded</h3>
          <p className="text-gray-500">Upload a PDF or DOCX file to start reading</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {document.genre && `${document.genre} • `}
              {document.reading_level && `${document.reading_level} Level`}
            </h2>
            <p className="text-sm text-gray-600">
              Page {currentPage + 1} of {document.pages.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-lg transition-colors ${
                focusMode 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Focus Mode"
            >
              {focusMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div 
        ref={readerRef}
        className={`p-6 overflow-y-auto h-96 ${focusMode ? 'focus-mode' : ''}`}
        style={{ 
          fontFamily: settings.font_size === 16 ? 'OpenDyslexic' : 'Inter',
          fontSize: `${settings.font_size}px`,
          lineHeight: settings.line_spacing,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPageData.lines.map((line, lineIndex) => {
              const isCurrentLine = lineIndex === currentLine
              const shouldBlur = settings.blur_non_important && !isCurrentLine && line.importance_score < 0.5
              const isCharacterVoice = line.character && settings.enable_character_voices

              return (
                <motion.div
                  key={lineIndex}
                  className={`line mb-2 p-3 rounded-lg transition-all duration-300 ${
                    isCurrentLine 
                      ? 'focus-line' 
                      : shouldBlur 
                        ? 'blurred-line' 
                        : 'hover:bg-gray-50'
                  } ${isCharacterVoice ? 'character-voice' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: lineIndex * 0.05 }}
                >
                  {/* Character indicator */}
                  {isCharacterVoice && (
                    <div className="text-xs font-medium text-blue-600 mb-1">
                      {line.character}
                    </div>
                  )}

                  {/* Line text with word highlighting */}
                  <div className="reading-text">
                    {line.words.map((word, wordIndex) => {
                      const isCurrentWord = isCurrentLine && wordIndex === currentWord
                      const isKeyword = word.is_keyword && settings.highlight_keywords

                      return (
                        <span
                          key={wordIndex}
                          className={`word inline-block transition-all duration-200 ${
                            isCurrentWord 
                              ? 'highlighted-word' 
                              : isKeyword 
                                ? 'keyword-highlight' 
                                : ''
                          }`}
                        >
                          {word.t}
                        </span>
                      )
                    })}
                  </div>

                  {/* Key concepts */}
                  {line.key_concepts.length > 0 && settings.highlight_keywords && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {line.key_concepts.map((concept, conceptIndex) => (
                        <span
                          key={conceptIndex}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Visualization placeholder */}
                  {line.visualization && settings.show_visualizations && isCurrentLine && (
                    <div className="visualization-container mt-3">
                      <div className="visualization-placeholder">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm font-medium mb-1">Visualization</p>
                        <p className="text-xs text-gray-500">{line.visualization.description}</p>
                        <div className="mt-2 flex gap-1">
                          {line.visualization.colors.map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentLine(Math.max(0, currentLine - 1))}
              disabled={currentLine === 0}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={() => setCurrentLine(Math.min(currentPageData.lines.length - 1, currentLine + 1))}
              disabled={currentLine === currentPageData.lines.length - 1}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Line {currentLine + 1} of {currentPageData.lines.length}
            </div>
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {settings.reading_speed}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
