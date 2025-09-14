import React, { useState, useEffect } from 'react';

export const UseCasesSection = () => {
  const [activeCase, setActiveCase] = useState(0);
  
  const cases = [
    { title: "ADHD Support", stat: "78%", metric: "Focus Improvement" },
    { title: "Dyslexia Aid", stat: "65%", metric: "Reading Speed" }, 
    { title: "Language Learning", stat: "3x", metric: "Retention Rate" },
    { title: "Academic Performance", stat: "90%", metric: "Grade Improvement" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCase(prev => (prev + 1) % cases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-white mb-2">Impact Across Communities</h3>
            <p className="text-slate-400">Real results from real users</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cases.map((useCase, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg text-center transition-all cursor-pointer ${
                  activeCase === index 
                    ? 'bg-blue-500/20 border border-blue-500/50' 
                    : 'bg-slate-700/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setActiveCase(index)}
              >
                <div className={`text-3xl font-bold mb-2 ${
                  activeCase === index ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {useCase.stat}
                </div>
                <div className="text-sm text-slate-400">{useCase.metric}</div>
                <div className="text-xs text-slate-500 mt-1">{useCase.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};