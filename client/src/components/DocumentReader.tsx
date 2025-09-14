import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, 
  BookOpen, Eye, EyeOff, Zap, Clock, User 
} from 'lucide-react'

interface DocumentReaderProps {
  document: any
  isAutoReading: boolean
  autoReaderStatus: any
  className?: string
}

export default function DocumentReader({ 
  document, 
  isAutoReading, 
  autoReaderStatus,
  className = '' 
}: DocumentReaderProps) {
  const {
    currentPage,
    currentLine,
    currentWord,
    settings,
    focusMode,
    getCurrentPage,
    getCurrentLine,
    setCurrentLine,
    setCurrentWord,
    setFocusMode,
  } = useStore()

  const readerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  const currentPageData = getCurrentPage()
  const currentLineData = getCurrentLine()

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineData && readerRef.current && !isScrolling) {
      const lineElement = readerRef.current.querySelector(`[data-line-index="${currentLine}"]`)
      if (lineElement) {
        lineElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }, [currentLine, currentLineData, isScrolling])

  // Update current line from auto-reader
  useEffect(() => {
    if (autoReaderStatus && autoReaderStatus.current_line !== undefined) {
      setCurrentLine(autoReaderStatus.current_line)
    }
  }, [autoReaderStatus, setCurrentLine])

  // Update current line from store
  useEffect(() => {
    if (currentLine !== undefined) {
      // Force re-render when current line changes
    }
  }, [currentLine])

  if (!document || !currentPageData) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to ADHD Reader</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Upload a PDF document to start your personalized reading experience with AI-powered visualizations and voice assistance.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <span>AI Visualizations</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 size={16} />
              <span>Voice Reading</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>Focus Mode</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
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
          <div className="flex items-center gap-3">
            {/* Auto-reading indicator */}
            {isAutoReading && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-reading</span>
              </div>
            )}
            
            {/* Focus mode toggle */}
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
        className={`p-6 overflow-y-auto h-[calc(100%-8rem)] ${focusMode ? 'focus-mode' : ''}`}
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
            className="max-w-4xl mx-auto"
          >
            {currentPageData.lines.map((line: any, lineIndex: number) => {
              const isCurrentLine = lineIndex === currentLine
              const shouldBlur = settings.blur_non_important && !isCurrentLine && line.importance_score < 0.5
              const isCharacterVoice = line.character && settings.enable_character_voices

              return (
                <motion.div
                  key={lineIndex}
                  data-line-index={lineIndex}
                  className={`line mb-4 p-4 rounded-xl transition-all duration-500 ${
                    isCurrentLine 
                      ? 'focus-line bg-blue-50 border-2 border-blue-200 shadow-md' 
                      : shouldBlur 
                        ? 'blurred-line opacity-30' 
                        : 'hover:bg-gray-50 border border-transparent'
                  } ${isCharacterVoice ? 'character-voice' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: lineIndex * 0.05 }}
                  onMouseEnter={() => setIsScrolling(true)}
                  onMouseLeave={() => setIsScrolling(false)}
                >
                  {/* Character indicator */}
                  {isCharacterVoice && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={12} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600">
                        {line.character}
                      </span>
                    </div>
                  )}

                  {/* Line text with word highlighting */}
                  <div className="reading-text leading-relaxed">
                    {line.words.map((word: any, wordIndex: number) => {
                      const isCurrentWord = isCurrentLine && wordIndex === currentWord
                      const isKeyword = word.is_keyword && settings.highlight_keywords

                      return (
                        <span
                          key={wordIndex}
                          className={`word inline-block transition-all duration-300 ${
                            isCurrentWord 
                              ? 'highlighted-word bg-yellow-200 text-yellow-900 px-1 rounded' 
                              : isKeyword 
                                ? 'keyword-highlight bg-green-100 text-green-800 px-1 rounded' 
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      {line.key_concepts.map((concept: string, conceptIndex: number) => (
                        <span
                          key={conceptIndex}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reading difficulty indicator */}
                  {isCurrentLine && line.reading_difficulty !== undefined && (
                    <div className="mt-3 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            line.reading_difficulty < 0.3
                              ? 'bg-green-500'
                              : line.reading_difficulty < 0.7
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${line.reading_difficulty * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {line.reading_difficulty < 0.3
                          ? 'Easy'
                          : line.reading_difficulty < 0.7
                          ? 'Medium'
                          : 'Hard'}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Line {currentLine + 1} of {currentPageData.lines.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentLine + 1) / currentPageData.lines.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentLine + 1) / currentPageData.lines.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
