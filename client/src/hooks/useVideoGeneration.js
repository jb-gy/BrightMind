import { useState, useCallback } from 'react';
import { GeminiVideoService } from '../services/geminiIntegration';

export const useVideoGeneration = (apiKey) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const geminiService = new GeminiVideoService(apiKey);
  
  const generateVideo = useCallback(async (text, options = {}) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await geminiService.generateVideo(text, options);
      setVideoUrl(result.videoUrl);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Video generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [geminiService]);
  
  const resetVideo = useCallback(() => {
    setVideoUrl(null);
    setError(null);
  }, []);
  
  return {
    isGenerating,
    videoUrl,
    error,
    generateVideo,
    resetVideo
  };
};