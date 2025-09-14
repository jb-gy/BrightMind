import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Word {
  t: string
  bbox?: [number, number, number, number]
  importance_score: number
  character?: string
  is_keyword: boolean
}

export interface Line {
  index: number
  text: string
  bbox?: [number, number, number, number]
  words: Word[]
  paragraph_id?: string
  importance_score: number
  character?: string
  visualization?: {
    type: 'image' | 'video'
    description: string
    style: string
    colors: string[]
    objects: string[]
    mood: string
    confidence: number
    image_url?: string
    video_url?: string
  }
  key_concepts: string[]
  reading_difficulty: number
}

export interface Page {
  index: number
  width?: number
  height?: number
  lines: Line[]
  background_image?: string
}

export interface DocumentLayout {
  pages: Page[]
  characters: string[]
  genre?: string
  reading_level?: string
}

export interface TTSWordTiming {
  word_index: number
  start_ms: number
  end_ms: number
  character?: string
}

export interface ADHDReadingSettings {
  blur_non_important: boolean
  highlight_keywords: boolean
  show_visualizations: boolean
  enable_character_voices: boolean
  reading_speed: number
  font_size: number
  line_spacing: number
  color_theme: string
  focus_mode: boolean
  visualization_style: string
  selected_voice: string
}

export interface ReadingProgress {
  user_id: string
  document_id: string
  current_line: number
  total_lines: number
  reading_speed: number
  comprehension_score: number
  time_spent: number
  characters_encountered: string[]
}

interface AppState {
  // Document state
  document: DocumentLayout | null
  currentPage: number
  currentLine: number
  currentWord: number
  
  // Reading state
  isPlaying: boolean
  isPaused: boolean
  currentAudio: HTMLAudioElement | null
  
  // TTS state
  timings: TTSWordTiming[]
  availableVoices: any[]
  selectedVoice: string
  selectedCharacter: string | null
  
  // Settings
  settings: ADHDReadingSettings
  
  // Progress tracking
  readingProgress: ReadingProgress | null
  milestones: any[]
  
  // UI state
  showSettings: boolean
  showVisualizations: boolean
  focusMode: boolean
  
  // Actions
  setDocument: (document: DocumentLayout | null) => void
  setCurrentPage: (page: number) => void
  setCurrentLine: (line: number) => void
  setCurrentWord: (word: number) => void
  setPlaying: (playing: boolean) => void
  setPaused: (paused: boolean) => void
  setCurrentAudio: (audio: HTMLAudioElement | null) => void
  setTimings: (timings: TTSWordTiming[]) => void
  setAvailableVoices: (voices: any[]) => void
  setSelectedVoice: (voice: string) => void
  setSelectedCharacter: (character: string | null) => void
  updateSettings: (settings: Partial<ADHDReadingSettings>) => void
  setReadingProgress: (progress: ReadingProgress | null) => void
  addMilestone: (milestone: any) => void
  setShowSettings: (show: boolean) => void
  setShowVisualizations: (show: boolean) => void
  setFocusMode: (focus: boolean) => void
  setLineVisualization: (lineIndex: number, visualization: Line['visualization']) => void
  
  // Computed getters
  getCurrentLine: () => Line | null
  getCurrentPage: () => Page | null
  getTotalLines: () => number
  getProgressPercentage: () => number
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      document: null,
      currentPage: 0,
      currentLine: 0,
      currentWord: 0,
      isPlaying: false,
      isPaused: false,
      currentAudio: null,
      timings: [],
      availableVoices: [],
      selectedVoice: 'narrator',
      selectedCharacter: null,
      settings: {
        blur_non_important: true,
        highlight_keywords: true,
        show_visualizations: true,
        enable_character_voices: true,
        reading_speed: 1.0,
        font_size: 16,
        line_spacing: 1.5,
        color_theme: 'default',
        focus_mode: true,
        visualization_style: 'cartoon',
        selected_voice: 'narrator',
      },
      readingProgress: null,
      milestones: [],
      showSettings: false,
      showVisualizations: true,
      focusMode: true,
      
      // Actions
      setDocument: (document) => set({ document }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setCurrentLine: (line) => set({ currentLine: line }),
      setCurrentWord: (word) => set({ currentWord: word }),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setPaused: (paused) => set({ isPaused: paused }),
      setCurrentAudio: (audio) => set({ currentAudio: audio }),
      setTimings: (timings) => set({ timings }),
      setAvailableVoices: (voices) => set({ availableVoices: voices }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      setSelectedCharacter: (character) => set({ selectedCharacter: character }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      setReadingProgress: (progress) => set({ readingProgress: progress }),
      addMilestone: (milestone) => set((state) => ({
        milestones: [...state.milestones, milestone]
      })),
      setShowSettings: (show) => set({ showSettings: show }),
      setShowVisualizations: (show) => set({ showVisualizations: show }),
      setFocusMode: (focus) => set({ focusMode: focus }),
      
      setLineVisualization: (lineIndex: number, visualization: Line['visualization']) => {
        set((state) => {
          if (!state.document?.pages) return state;
          
          const updatedPages = state.document.pages.map((page, pageIndex) => {
            if (pageIndex === state.currentPage) {
              const updatedLines = page.lines.map((line, idx) => {
                if (idx === lineIndex) {
                  return { ...line, visualization };
                }
                return line;
              });
              return { ...page, lines: updatedLines };
            }
            return page;
          });
          
          return {
            ...state,
            document: {
              ...state.document,
              pages: updatedPages
            }
          };
        });
      },
      
      // Computed getters
      getCurrentLine: () => {
        const state = get()
        if (!state.document || state.currentPage >= state.document.pages.length) {
          return null
        }
        const page = state.document.pages[state.currentPage]
        if (state.currentLine >= page.lines.length) {
          return null
        }
        return page.lines[state.currentLine]
      },
      
      getCurrentPage: () => {
        const state = get()
        if (!state.document || state.currentPage >= state.document.pages.length) {
          return null
        }
        return state.document.pages[state.currentPage]
      },
      
      getTotalLines: () => {
        const state = get()
        if (!state.document) return 0
        return state.document.pages.reduce((total, page) => total + page.lines.length, 0)
      },
      
      getProgressPercentage: () => {
        const state = get()
        const totalLines = state.getTotalLines()
        if (totalLines === 0) return 0
        return (state.currentLine / totalLines) * 100
      },
    }),
    {
      name: 'adhd-reader-storage',
      partialize: (state) => ({
        settings: state.settings,
        readingProgress: state.readingProgress,
        milestones: state.milestones,
      }),
    }
  )
)