import React from 'react';
import { Button } from '../common/Button';

export const CTASection = ({ onLaunchApp }) => {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Reading?
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Join thousands using AI-powered reading assistance to unlock their full potential
        </p>
        <Button size="lg" onClick={onLaunchApp}>
          Launch Application
        </Button>
      </div>
    </div>
  );
};