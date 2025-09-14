import React from 'react';
import { Brain, Volume2, Eye } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Content Analysis",
      description: "Advanced algorithms analyze text complexity and adapt to individual learning patterns",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Volume2,
      title: "Voice Synthesis",
      description: "Dynamic character voices bring stories to life with emotional context",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Eye,
      title: "Visual Guidance",
      description: "Smart highlighting reduces distractions for ADHD and attention challenges",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Advanced Reading Technology
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Breakthrough AI combines with deep learning research to create personalized reading experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all group">
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
