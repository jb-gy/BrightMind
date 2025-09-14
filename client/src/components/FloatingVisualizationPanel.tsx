import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Image, Sparkles, Eye, EyeOff, 
  Download, RefreshCw, Zap, Brain 
} from 'lucide-react'

interface FloatingVisualizationPanelProps {
  currentImageGeneration: any
  isGenerating: boolean
  line: any
  className?: string
}

export default function FloatingVisualizationPanel({ 
  currentImageGeneration, 
  isGenerating, 
  line,
  className = '' 
}: FloatingVisualizationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDescription, setShowDescription] = useState(true)

  if (!line && !currentImageGeneration) {
    return (
      <div className={`${className} h-full`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <Palette size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Visualization Panel</h3>
            <p className="text-sm">Images will appear here as you read</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`${className} h-full`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">AI Visualizations</h3>
                <p className="text-xs text-gray-600">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-6 overflow-y-auto"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
                    />
                    <p className="text-sm text-gray-600">Generating visualization...</p>
                    <p className="text-xs text-gray-500 mt-1">Using AI to create images</p>
                  </div>
                </div>
              ) : currentImageGeneration ? (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {currentImageGeneration.image_url ? (
                        <img 
                          src={currentImageGeneration.image_url} 
                          alt="Generated visualization"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-center">
                          <Image size={48} className="text-purple-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-purple-600">Generated Image</p>
                          <p className="text-xs text-purple-500 mt-1">
                            {currentImageGeneration.style} style
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Image Overlay Info */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="flex items-center gap-1">
                        <Sparkles size={12} className="text-purple-500" />
                        <span className="text-xs font-medium text-purple-600">
                          {Math.round((currentImageGeneration.metadata?.confidence || 0.9) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Line Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Line {currentImageGeneration.line_index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {currentImageGeneration.line_text}
                    </p>
                  </div>

                  {/* Description */}
                  {showDescription && currentImageGeneration.image_description && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">AI Description</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {currentImageGeneration.image_description}
                      </p>
                    </motion.div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Style</div>
                      <div className="text-sm font-medium text-gray-800 capitalize">
                        {currentImageGeneration.style}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Confidence</div>
                      <div className="text-sm font-medium text-gray-800">
                        {Math.round((currentImageGeneration.metadata?.confidence || 0.9) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowDescription(!showDescription)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <Eye size={14} />
                      {showDescription ? 'Hide' : 'Show'} Description
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Palette size={48} className="mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Ready for Visualization</h4>
                    <p className="text-sm text-gray-500">
                      Start reading to see AI-generated images for each line
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Sparkles size={12} />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
