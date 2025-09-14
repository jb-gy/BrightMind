import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Brain } from 'lucide-react';

export const HeroSection = ({ onStartReading }) => {
  const [readersCount, setReadersCount] = useState(1247);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setReadersCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50 backdrop-blur-lg mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-white font-semibold mr-2">LIVE NOW</span>
              <span className="text-slate-300">{readersCount.toLocaleString()} readers active</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              READING
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                REIMAGINED
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-lg">
              AI-powered reading assistant that adapts to your cognitive patterns. 
              Transform how you consume content with personalized guidance and support.
            </p>
            
            <Button size="lg" onClick={onStartReading}>
              Start Reading Now
            </Button>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-700/50">
              <div>
                <div className="text-3xl font-bold text-white">85%</div>
                <div className="text-sm text-slate-400">Better Focus</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">3x</div>
                <div className="text-sm text-slate-400">Faster Reading</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">92%</div>
                <div className="text-sm text-slate-400">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};