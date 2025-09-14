import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { Settings as SettingsIcon, X, Volume2, Eye, EyeOff, Palette, Type } from 'lucide-react'

interface SettingsProps {
  className?: string
}

export default function Settings({ className = '' }: SettingsProps) {
  const {
    settings,
    availableVoices,
    selectedVoice,
    selectedCharacter,
    document,
    updateSettings,
    setSelectedVoice,
    setSelectedCharacter,
    setAvailableVoices,
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  // Load available voices on component mount
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
  }, [setAvailableVoices])

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    updateSettings(newSettings)
  }

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice)
  }

  const handleCharacterChange = (character: string | null) => {
    setSelectedCharacter(character)
  }

  const colorThemes = [
    { name: 'default', label: 'Default', colors: ['#3b82f6', '#1d4ed8'] },
    { name: 'warm', label: 'Warm', colors: ['#f59e0b', '#d97706'] },
    { name: 'cool', label: 'Cool', colors: ['#10b981', '#059669'] },
    { name: 'purple', label: 'Purple', colors: ['#8b5cf6', '#7c3aed'] },
    { name: 'pink', label: 'Pink', colors: ['#ec4899', '#db2777'] },
  ]

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`p-3 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors ${className}`}
        title="Open Settings"
      >
        <SettingsIcon size={20} />
      </button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="settings-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Reading Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Settings Sections */}
              <div className="space-y-6">
                {/* Visual Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Eye size={20} />
                    Visual Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Blur Non-Important Lines
                      </label>
                      <input
                        type="checkbox"
                        checked={localSettings.blur_non_important}
                        onChange={(e) => handleSettingChange('blur_non_important', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Highlight Keywords
                      </label>
                      <input
                        type="checkbox"
                        checked={localSettings.highlight_keywords}
                        onChange={(e) => handleSettingChange('highlight_keywords', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Show Visualizations
                      </label>
                      <input
                        type="checkbox"
                        checked={localSettings.show_visualizations}
                        onChange={(e) => handleSettingChange('show_visualizations', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Focus Mode
                      </label>
                      <input
                        type="checkbox"
                        checked={localSettings.focus_mode}
                        onChange={(e) => handleSettingChange('focus_mode', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Type size={20} />
                    Typography
                  </h3>
                  <div className="space-y-4">
                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Font Size: {localSettings.font_size}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={localSettings.font_size}
                        onChange={(e) => handleSettingChange('font_size', parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Line Spacing: {localSettings.line_spacing}x
                      </label>
                      <input
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.1"
                        value={localSettings.line_spacing}
                        onChange={(e) => handleSettingChange('line_spacing', parseFloat(e.target.value))}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Audio Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Volume2 size={20} />
                    Audio Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Enable Character Voices
                      </label>
                      <input
                        type="checkbox"
                        checked={localSettings.enable_character_voices}
                        onChange={(e) => handleSettingChange('enable_character_voices', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="setting-item">
                      <label className="text-sm font-medium text-gray-600">
                        Reading Speed: {localSettings.reading_speed}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={localSettings.reading_speed}
                        onChange={(e) => handleSettingChange('reading_speed', parseFloat(e.target.value))}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Voice Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Voice Type
                      </label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => handleVoiceChange(e.target.value)}
                        className="voice-selector w-full"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.display_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Character Selection */}
                    {document?.characters && document.characters.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Character Voice
                        </label>
                        <select
                          value={selectedCharacter || ''}
                          onChange={(e) => handleCharacterChange(e.target.value || null)}
                          className="voice-selector w-full"
                        >
                          <option value="">Auto-detect</option>
                          {document.characters.map((character) => (
                            <option key={character} value={character}>
                              {character}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Color Theme
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
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
                              className="w-4 h-4 rounded-full"
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
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
