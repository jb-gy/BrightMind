import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store";

interface ReaderProps {
  className?: string;
}

/**
 * Reader (revamped)
 * - No emojis or icon libraries
 * - Blue-first visual language
 * - Word-by-word + line-by-line highlighting
 * - Smooth auto-scroll to current line
 * - Accessibility + keyboard shortcuts (arrows, space, f)
 * - Top progress bar
 * - Clean placeholder for AI visualization hook
 */
export default function Reader({ className = "" }: ReaderProps) {
  const {
    document,
    currentPage,
    currentLine,
    currentWord,
    isPlaying,
    isPaused,
    settings,
    focusMode,
    getCurrentPage,
    getCurrentLine,
    setCurrentLine,
    setCurrentWord,
    setPlaying,
    setPaused,
    setFocusMode,
  } = useStore();

  const readerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);

  const currentPageData = getCurrentPage();
  const currentLineData = getCurrentLine();

  // Compute progress across the page (by line index)
  const pageProgress = useMemo(() => {
    if (!currentPageData || currentPageData.lines.length === 0) return 0;
    return Math.round(((currentLine + 1) / currentPageData.lines.length) * 100);
  }, [currentLine, currentPageData]);

  // Auto-scroll current line into view
  useEffect(() => {
    const el = lineRefs.current[currentLine];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLine, currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentPageData) return;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          if (currentLine < currentPageData.lines.length - 1) setCurrentLine(currentLine + 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          if (currentLine > 0) setCurrentLine(currentLine - 1);
          break;
        case " ": // space
          e.preventDefault();
          if (isPlaying) setPaused(!isPaused);
          else setPlaying(true);
          break;
        case "f":
        case "F":
          e.preventDefault();
          setFocusMode(!focusMode);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentLine, currentPageData, isPlaying, isPaused, focusMode, setCurrentLine, setPlaying, setPaused, setFocusMode]);

  if (!document || !currentPageData) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Document Loaded</h3>
          <p className="text-slate-500">Upload a PDF or DOCX file to start reading.</p>
        </div>
      </div>
    );
  }

  return (
    <section
      className={`rounded-2xl shadow-lg border border-slate-200 overflow-hidden bg-white ${className}`}
      aria-label="Reader"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {document.genre && `${document.genre} • `}
              {document.reading_level && `${document.reading_level} Level`}
            </h2>
            <p className="text-sm text-slate-600">Page {currentPage + 1} of {document.pages.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                focusMode
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
              aria-pressed={focusMode}
              aria-label="Toggle Focus Mode"
            >
              {focusMode ? "Focus On" : "Focus Off"}
            </button>
          </div>
        </div>
        {/* Top progress bar */}
        <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden" aria-label="Reading progress">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
            style={{ width: `${pageProgress}%` }}
          />
        </div>
      </div>

      {/* Reading Area */}
      <div
        ref={readerRef}
        className={`p-6 overflow-y-auto h-96 ${focusMode ? "focus-mode" : ""}`}
        style={{
          fontFamily: settings.font_size === 16 ? "OpenDyslexic" : "Inter, ui-sans-serif, system-ui",
          fontSize: `${settings.font_size}px`,
          lineHeight: settings.line_spacing,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {currentPageData.lines.map((line, lineIndex) => {
              const isCurrentLine = lineIndex === currentLine;
              const shouldBlur = settings.blur_non_important && !isCurrentLine && line.importance_score < 0.5;
              const isCharacterVoice = Boolean(line.character && settings.enable_character_voices);

              return (
                <motion.div
                  key={lineIndex}
                  ref={(el) => {
                    if (el) lineRefs.current[lineIndex] = el;
                  }}
                  className={[
                    "mb-2 p-3 rounded-lg transition-all duration-300",
                    isCurrentLine
                      ? "bg-blue-50 ring-1 ring-blue-200 shadow-sm"
                      : shouldBlur
                      ? "opacity-60 blur-[1px]"
                      : "hover:bg-slate-50",
                    isCharacterVoice ? "border border-sky-100" : "",
                  ].join(" ")}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: lineIndex * 0.03 }}
                >
                  {/* Character label (text only) */}
                  {isCharacterVoice && (
                    <div className="text-[11px] font-medium text-blue-700 mb-1 tracking-wide uppercase">
                      {line.character}
                    </div>
                  )}

                  {/* Line text with word highlighting */}
                  <div className="reading-text">
                    {line.words.map((word: any, wordIndex: number) => {
                      const isCurrentWord = isCurrentLine && wordIndex === currentWord;
                      const isKeyword = Boolean(word.is_keyword && settings.highlight_keywords);

                      return (
                        <span
                          key={wordIndex}
                          className={[
                            "inline-block mr-1.5 transition-colors",
                            isCurrentWord
                              ? "px-1 rounded bg-blue-500/20 text-blue-800 font-semibold"
                              : isKeyword
                              ? "px-0.5 rounded bg-amber-200/40 text-amber-900"
                              : "text-slate-800",
                          ].join(" ")}
                        >
                          {word.t}
                        </span>
                      );
                    })}
                  </div>

                  {/* Key concepts */}
                  {line.key_concepts?.length > 0 && settings.highlight_keywords && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {line.key_concepts.map((concept: string, idx: number) => (
                        <span key={idx} className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Visualization hook (no emojis/icons) */}
                  {line.visualization && settings.show_visualizations && isCurrentLine && (
                    <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="text-sm font-medium text-slate-800">Visualization</div>
                      <p className="text-xs text-slate-600 mt-1">{line.visualization.description}</p>
                      {/* Palette preview */}
                      {Array.isArray(line.visualization.colors) && (
                        <div className="mt-2 flex gap-1.5">
                          {line.visualization.colors.map((c: string, i: number) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentLine(Math.max(0, currentLine - 1))}
              disabled={currentLine === 0}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 text-sm font-medium"
            >
              Prev
            </button>

            <button
              onClick={() => setPlaying(!(isPlaying && !isPaused))}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold"
              aria-pressed={isPlaying && !isPaused}
            >
              {isPlaying && !isPaused ? "Pause" : "Play"}
            </button>

            <button
              onClick={() => setCurrentLine(Math.min(currentPageData.lines.length - 1, currentLine + 1))}
              disabled={currentLine === currentPageData.lines.length - 1}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 text-sm font-medium"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-700">Line {currentLine + 1} of {currentPageData.lines.length}</div>
            <div className="text-sm text-slate-600">Speed {settings.reading_speed}x</div>
          </div>
        </div>
      </div>
    </section>
  );
}
