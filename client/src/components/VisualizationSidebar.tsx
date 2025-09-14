import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { Palette, Image, Video, Sparkles, Eye } from 'lucide-react'

interface VisualizationSidebarProps {
  className?: string
}

export default function VisualizationSidebar({ className = '' }: VisualizationSidebarProps) {
  const {
    document,
    currentLine,
    settings,
    getCurrentLine,
  } = useStore()

  const [isOpen, setIsOpen] = useState(true)
  const [loadingVisualizations, setLoadingVisualizations] = useState(false)

  const currentLineData = getCurrentLine()

  // Generate visualizations for current line if needed
  useEffect(() => {
    const generateVisualization = async () => {
      if (!currentLineData || !settings.show_visualizations || currentLineData.visualization) {
        return
      }

      setLoadingVisualizations(true)
      try {
        const response = await fetch('http://localhost:8000/visualizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: currentLineData.text,
            line_index: currentLineData.index,
            visualization_type: 'image',
            context: document?.genre || 'general'
          })
        })

        if (response.ok) {
          const visualizationData = await response.json()
          // Update the line with visualization data
          // This would require updating the store to handle line updates
          console.log('Generated visualization:', visualizationData)
        }
      } catch (error) {
        console.error('Error generating visualization:', error)
      } finally {
        setLoadingVisualizations(false)
      }
    }

    generateVisualization()
  }, [currentLineData, settings.show_visualizations, document?.genre])

  if (!document || !settings.show_visualizations) {
    return null
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 250, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Visualizations</h3>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-full pb-20">
        {currentLineData && currentLineData.visualization ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLineData.index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Current Line Visualization */}
              <div className="visualization-card">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Line {currentLineData.index + 1}
                  </span>
                </div>

                {/* Visualization Content */}
                <div className="visualization-content">
                  {currentLineData.visualization.type === 'image' ? (
                    <div className="image-visualization">
                      {/* Placeholder for actual image generation */}
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <div className="text-center">
                          <Image size={32} className="text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-purple-600 font-medium">Image Visualization</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="video-visualization">
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <div className="text-center">
                          <Video size={32} className="text-blue-400 mx-auto mb-2" />
                          <p className="text-sm text-blue-600 font-medium">Video Visualization</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visualization Details */}
                  <div className="visualization-details space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-1">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {currentLineData.visualization.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Style</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {currentLineData.visualization.style}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {currentLineData.visualization.mood}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Colors</h4>
                      <div className="flex gap-2">
                        {currentLineData.visualization.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {currentLineData.visualization.objects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Objects</h4>
                        <div className="flex flex-wrap gap-1">
                          {currentLineData.visualization.objects.map((obj, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confidence</span>
                        <span>{Math.round(currentLineData.visualization.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${currentLineData.visualization.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Concepts */}
              {currentLineData.key_concepts.length > 0 && (
                <div className="key-concepts-card">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Key Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentLineData.key_concepts.map((concept, index) => (
                      <span
                        key={index}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Character Information */}
              {currentLineData.character && (
                <div className="character-info-card">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Character</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {currentLineData.character.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{currentLineData.character}</span>
                  </div>
                </div>
              )}

              {/* Reading Difficulty */}
              <div className="reading-difficulty-card">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Reading Difficulty</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentLineData.reading_difficulty < 0.3
                          ? 'bg-green-500'
                          : currentLineData.reading_difficulty < 0.7
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${currentLineData.reading_difficulty * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {currentLineData.reading_difficulty < 0.3
                      ? 'Easy'
                      : currentLineData.reading_difficulty < 0.7
                      ? 'Medium'
                      : 'Hard'}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : loadingVisualizations ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Generating visualization...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Palette size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No visualization available</p>
              <p className="text-xs text-gray-400 mt-1">
                Visualizations will appear for important lines
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full bg-white border border-gray-200 rounded-l-lg p-2 shadow-lg transition-all duration-300 ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Palette size={16} className="text-purple-600" />
      </button>
    </motion.div>
  )
}
