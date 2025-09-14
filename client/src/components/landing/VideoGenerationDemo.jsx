import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

// Video Generation Demo Component
const VideoGenerationDemo = ({ text, currentWord, isPlaying }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef(null);
  
  const words = text.split(' ');
  
  // Simulate video generation based on text
  useEffect(() => {
    if (isPlaying && !videoUrl) {
      generateVideo();
    }
  }, [isPlaying, text]);
  
  const generateVideo = async () => {
    setIsGenerating(true);
    
    // Simulate API call to Gemini Video Generation
    try {
      // This would be replaced with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a generated video URL
      setVideoUrl('/demo/generated-video.mp4');
      setIsGenerating(false);
    } catch (error) {
      console.error('Video generation failed:', error);
      setIsGenerating(false);
    }
  };
  
  const VideoPlaceholder = () => (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
      {/* Animated background representing video generation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isGenerating ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-blue-700 font-semibold">Generating Video...</div>
            <div className="text-sm text-blue-600">Powered by Google Gemini</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-blue-700 font-semibold">AI Video Generation</div>
            <div className="text-sm text-blue-600">Click play to start</div>
          </div>
        )}
      </div>
      
      {/* Current word highlight overlay */}
      {currentWord < words.length && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
          <div className="text-sm opacity-75 mb-1">Current Focus:</div>
          <div className="font-semibold text-lg">"{words[currentWord]}"</div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Video Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
          <span className="text-sm font-medium">AI Video Generation</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <Settings size={16} />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <Maximize size={16} />
          </button>
        </div>
      </div>
      
      {/* Video Content */}
      <div className="p-4">
        <VideoPlaceholder />
        
        {/* Text Visualization */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Text Analysis</h4>
            <div className="text-sm text-gray-500">
              {currentWord + 1} of {words.length} words
            </div>
          </div>
          
          <div className="text-base leading-relaxed">
            {words.map((word, index) => (
              <span
                key={index}
                className={`mr-2 transition-all duration-300 ${
                  index === currentWord 
                    ? 'bg-blue-200 text-blue-900 px-1 rounded font-semibold' 
                    : index < currentWord 
                      ? 'text-gray-400 line-through' 
                      : 'text-gray-700'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
          
          {/* Progress Indicators */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((currentWord / words.length) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Reading Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isGenerating ? 'Gen...' : 'Ready'}
              </div>
              <div className="text-xs text-gray-500">Video Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {audioEnabled ? 'ON' : 'OFF'}
              </div>
              <div className="text-xs text-gray-500">Audio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Controls Component
const AdvancedControls = ({ settings, onSettingsChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Generation Controls</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Style
          </label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={settings.videoStyle}
            onChange={(e) => onSettingsChange({...settings, videoStyle: e.target.value})}
          >
            <option value="educational">Educational</option>
            <option value="narrative">Narrative</option>
            <option value="interactive">Interactive</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reading Speed
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => onSettingsChange({...settings, speed: parseFloat(e.target.value)})}
            className="w-full"
          />
          <div className="text-sm text-gray-500">{settings.speed}x speed</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visual Effects
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.highlightEnabled}
                onChange={(e) => onSettingsChange({...settings, highlightEnabled: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Word Highlighting</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.blurEnabled}
                onChange={(e) => onSettingsChange({...settings, blurEnabled: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Focus Blur</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) => onSettingsChange({...settings, animationsEnabled: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Smooth Animations</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export components
export { VideoGenerationDemo, AdvancedControls };