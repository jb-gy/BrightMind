// config/constants.js
export const BRIGHTMIND_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY,
  
  // Animation timings
  WORD_HIGHLIGHT_DURATION: 600,
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Video generation settings
  VIDEO_GENERATION: {
    DEFAULT_STYLE: 'educational',
    SUPPORTED_FORMATS: ['mp4', 'webm'],
    MAX_DURATION: 300, // seconds
    QUALITY_OPTIONS: ['720p', '1080p', '4k']
  },
  
  // Reading settings
  READING: {
    DEFAULT_SPEED: 1.0,
    MIN_SPEED: 0.5,
    MAX_SPEED: 3.0,
    WORDS_PER_MINUTE: 200
  },
  
  // UI Colors
  COLORS: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hero: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      feature: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'
    }
  }
};

// utils/textProcessing.js
export class TextProcessor {
  static analyzeComplexity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    return {
      sentences: sentences.length,
      words: words.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
      readingLevel: this.calculateReadingLevel(avgWordsPerSentence, avgCharsPerWord),
      estimatedReadingTime: Math.ceil(words.length / BRIGHTMIND_CONFIG.READING.WORDS_PER_MINUTE)
    };
  }
  
  static calculateReadingLevel(avgWordsPerSentence, avgCharsPerWord) {
    // Simplified Flesch-Kincaid formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (avgCharsPerWord / 4.7));
    
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }
  
  static extractKeyPhrases(text, maxPhrases = 5) {
    // Simple keyword extraction (in production, use more sophisticated NLP)
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxPhrases)
      .map(([word]) => word);
  }
}

// utils/animations.js
export const createStaggeredAnimation = (elements, delay = 100) => {
  return elements.map((_, index) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * (delay / 1000), duration: 0.6 }
  }));
};

export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

// services/geminiIntegration.js
export class GeminiVideoService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }
  
  async generateVideo(textContent, options = {}) {
    const {
      style = 'educational',
      duration = 30,
      quality = '720p',
      voiceEnabled = true
    } = options;
    
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro-vision:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a ${style} video for the following text: "${textContent}". 
                     Duration: ${duration}s, Quality: ${quality}, Voice: ${voiceEnabled ? 'enabled' : 'disabled'}.
                     Focus on visual elements that enhance reading comprehension for users with attention challenges.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Video generation failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.processVideoResponse(result);
    } catch (error) {
      console.error('Gemini video generation error:', error);
      throw error;
    }
  }
  
  processVideoResponse(response) {
    // Process Gemini response and return video URL
    // This is a simplified version - actual implementation would handle
    // the complex video generation pipeline
    return {
      videoUrl: response.videoUrl || null,
      thumbnailUrl: response.thumbnailUrl || null,
      duration: response.duration || 0,
      generatedAt: new Date().toISOString(),
      metadata: response.metadata || {}
    };
  }
  
  async generateVisualizations(text, wordIndex) {
    // Generate contextual visualizations for specific words/phrases
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro-vision:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a visual description for the word at index ${wordIndex} in: "${text}". 
                     Create imagery that helps with reading comprehension and memory retention.`
            }]
          }]
        })
      });
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Visualization generation error:', error);
      return null;
    }
  }
}

// hooks/useReadingSession.js
import { useState, useEffect, useCallback } from 'react';

export const useReadingSession = (text, options = {}) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(options.defaultSpeed || 1.0);
  const [readingProgress, setReadingProgress] = useState(0);
  
  const words = text.split(' ');
  const intervalTime = (BRIGHTMIND_CONFIG.WORD_HIGHLIGHT_DURATION / speed);
  
  useEffect(() => {
    let interval;
    if (isPlaying && currentWord < words.length) {
      interval = setInterval(() => {
        setCurrentWord(prev => {
          const newWord = prev + 1;
          setReadingProgress((newWord / words.length) * 100);
          
          if (newWord >= words.length) {
            setIsPlaying(false);
            return prev;
          }
          return newWord;
        });
      }, intervalTime);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentWord, words.length, intervalTime]);
  
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const skipToWord = useCallback((wordIndex) => {
    setCurrentWord(Math.max(0, Math.min(wordIndex, words.length - 1)));
    setReadingProgress((wordIndex / words.length) * 100);
  }, [words.length]);
  
  const resetSession = useCallback(() => {
    setCurrentWord(0);
    setIsPlaying(false);
    setReadingProgress(0);
  }, []);
  
  return {
    currentWord,
    isPlaying,
    speed,
    readingProgress,
    words,
    togglePlayback,
    skipToWord,
    resetSession,
    setSpeed
  };
};

// components/common/LoadingSpinner.jsx
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500'
  };
  
  return (
    <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
};

// components/common/ProgressBar.jsx
export const ProgressBar = ({ progress, className = '', showPercentage = true }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
      </div>
      {showPercentage && (
        <div className="text-right text-sm text-gray-600 mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Export all utilities
export * from './textProcessing';
export * from './animations';
export * from './geminiIntegration';