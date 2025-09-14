import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Volume2, Palette, Type, Eye, EyeOff, 
  Sun, Moon, Brightness, Contrast, Settings,
  Mic, MicOff, Zap, Brain, Clock
} from 'lucide-react'

interface SettingsPanelProps {
  settings: any
  updateSettings: (settings: any) => void
  selectedVoice: string
  selectedCharacter: string | null
  className?: string
}

export default function SettingsPanel({ 
  settings, 
  updateSettings, 
  selectedVoice, 
  selectedCharacter,
  className = '' 
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [availableVoices, setAvailableVoices] = useState<any[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('http://localhost:8000/voices')
        const data = await response.json()
        setAvailableVoices(data.voices || [])
      } catch (error) {
        console.error('Failed to load voices:', error)
      }
    }
    loadVoices()
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    updateSettings(newSettings)
  }

  const colorThemes = [
    { name: 'default', label: 'Default', colors: ['#3b82f6', '#1d4ed8'] },
    { name: 'warm', label: 'Warm', colors: ['#f59e0b', '#d97706'] },
    { name: 'cool', label: 'Cool', colors: ['#10b981', '#059669'] },
    { name: 'purple', label: 'Purple', colors: ['#8b5cf6', '#7c3aed'] },
    { name: 'dark', label: 'Dark', colors: ['#1f2937', '#111827'] },
  ]

  const imageStyles = [
    { name: 'cartoon', label: 'Cartoon', description: 'Child-friendly cartoon style' },
    { name: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { name: 'watercolor', label: 'Watercolor', description: 'Artistic watercolor style' },
    { name: 'minimalist', label: 'Minimalist', description: 'Clean, simple designs' },
    { name: 'fantasy', label: 'Fantasy', description: 'Magical, fantasy art' },
  ]

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
              <p className="text-xs text-gray-600">Customize your experience</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        
        {/* Audio Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Volume2 size={16} />
            Audio Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Reading Speed</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={localSettings.reading_speed}
                  onChange={(e) => handleSettingChange('reading_speed', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {localSettings.reading_speed}x
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Voice Type</label>
              <select
                value={selectedVoice}
                onChange={(e) => handleSettingChange('selected_voice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSettings.enable_character_voices}
                onChange={(e) => handleSettingChange('enable_character_voices', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Enable Character Voices</label>
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Eye size={16} />
            Visual Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Font Size</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={localSettings.font_size}
                  onChange={(e) => handleSettingChange('font_size', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {localSettings.font_size}px
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Line Spacing</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={localSettings.line_spacing}
                  onChange={(e) => handleSettingChange('line_spacing', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 w-12">
                  {localSettings.line_spacing}x
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSettings.blur_non_important}
                onChange={(e) => handleSettingChange('blur_non_important', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Blur Non-Important Lines</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSettings.highlight_keywords}
                onChange={(e) => handleSettingChange('highlight_keywords', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Highlight Keywords</label>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Brain size={16} />
            AI Settings
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSettings.show_visualizations}
                onChange={(e) => handleSettingChange('show_visualizations', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Show AI Visualizations</label>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Image Style</label>
              <select
                value={localSettings.visualization_style || 'cartoon'}
                onChange={(e) => handleSettingChange('visualization_style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {imageStyles.map((style) => (
                  <option key={style.name} value={style.name}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Palette size={16} />
            Color Theme
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleSettingChange('color_theme', theme.name)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  localSettings.color_theme === theme.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {theme.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Mode */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Zap size={16} />
            Focus Mode
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localSettings.focus_mode}
              onChange={(e) => handleSettingChange('focus_mode', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">Enable Focus Mode</label>
          </div>
        </div>
      </div>
    </div>
  )
}
