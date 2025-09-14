import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, Line } from '../store';

interface VisualizationSidebarProps {
  className?: string;
}

export default function VisualizationSidebar({ className = '' }: VisualizationSidebarProps) {
  const {
    document,
    settings,
    getCurrentLine,
    setLineVisualization,
  } = useStore();

  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentLineData = getCurrentLine();

  const shouldAttemptGeneration = useMemo(() => {
    if (!settings?.show_visualizations) return false;
    if (!currentLineData) return false;
    return !currentLineData.visualization;
  }, [settings?.show_visualizations, currentLineData]);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      if (!shouldAttemptGeneration || !currentLineData) return;

      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/visualizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: currentLineData.text,
            line_index: currentLineData.index,
            visualization_type: 'image',
            context: document?.genre || 'general',
            style: settings?.visualization_style || 'cartoon',
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Line['visualization'] = await res.json();
        if (!cancelled && data) {
          setLineVisualization(currentLineData.index, data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Visualization generation failed:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [
    shouldAttemptGeneration,
    currentLineData?.index,
    currentLineData?.text,
    document?.genre,
    settings?.visualization_style,
    setLineVisualization,
  ]);

  if (!document || !settings?.show_visualizations) return null;

  const content = currentLineData?.visualization;

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 260, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl z-40 ${className}`}
      aria-label="AI Visualizations"
    >
      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Visualizations</h3>
            <p className="text-xs text-slate-600">Generated from the current line</p>
          </div>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            aria-pressed={isOpen}
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="p-5 overflow-y-auto h-full pb-24">
        {currentLineData ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLineData.index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {content ? (
                <>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">
                      Line {currentLineData.index + 1}
                    </div>

                    {content.type === 'image' ? (
                      content.image_url ? (
                        <img
                          src={content.image_url}
                          alt={content.description || 'Visualization'}
                          className="w-full h-48 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-full h-48 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
                      )
                    ) : content.video_url ? (
                      <video
                        src={content.video_url}
                        className="w-full h-48 rounded-lg border border-slate-200"
                        controls
                      />
                    ) : (
                      <div className="w-full h-48 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
                    )}
                  </div>

                  <div className="space-y-4">
                    {content.description && (
                      <div>
                        <div className="text-sm font-medium text-slate-800 mb-1">Description</div>
                        <p className="text-sm text-slate-600 leading-relaxed">{content.description}</p>
                      </div>
                    )}

                    {(content.style || content.mood) && (
                      <div className="flex items-center gap-2">
                        {content.style && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                            {content.style}
                          </span>
                        )}
                        {content.mood && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full border border-slate-200">
                            {content.mood}
                          </span>
                        )}
                      </div>
                    )}

                    {Array.isArray(content.colors) && content.colors.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-slate-800 mb-2">Colors</div>
                        <div className="flex gap-2">
                          {content.colors.map((c, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-white shadow-sm"
                              title={c}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(content.objects) && content.objects.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-slate-800 mb-2">Objects</div>
                        <div className="flex flex-wrap gap-1.5">
                          {content.objects.map((o, i) => (
                            <span
                              key={i}
                              className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-full border border-sky-200"
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {typeof content.confidence === 'number' && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Confidence</span>
                          <span>{Math.round(content.confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.round(content.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {Array.isArray(currentLineData.key_concepts) && currentLineData.key_concepts.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-slate-800 mb-2">Key Concepts</div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentLineData.key_concepts.map((c: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full border border-emerald-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : loading ? (
                <div className="h-32 grid place-items-center">
                  <div className="text-sm text-slate-600">Generating visualization…</div>
                </div>
              ) : (
                <div className="h-32 grid place-items-center">
                  <div className="text-sm text-slate-600">No visualization available.</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-32 grid place-items-center">
            <div className="text-sm text-slate-600">No line selected.</div>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white border border-slate-200 rounded-l-lg px-3 py-2 shadow-lg transition-opacity ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open visualizations"
      >
        Open
      </button>
    </motion.aside>
  );
}