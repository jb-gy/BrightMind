import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, Download, Trash2, Plus, Edit3, 
  Bookmark, Clock, User, FileText 
} from 'lucide-react'

interface NotesPanelProps {
  notes: string
  setNotes: (notes: string) => void
  onSave: () => void
  className?: string
}

interface NoteEntry {
  id: string
  text: string
  timestamp: Date
  lineNumber?: number
  lineText?: string
}

export default function NotesPanel({ 
  notes, 
  setNotes, 
  onSave,
  className = '' 
}: NotesPanelProps) {
  const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')

  // Load saved notes on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('reading_notes_entries')
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }))
        setNoteEntries(parsed)
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }
  }, [])

  // Save notes to localStorage
  const saveNotesToStorage = (entries: NoteEntry[]) => {
    localStorage.setItem('reading_notes_entries', JSON.stringify(entries))
  }

  const addNote = () => {
    if (newNote.trim()) {
      const note: NoteEntry = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date()
      }
      
      const updatedNotes = [...noteEntries, note]
      setNoteEntries(updatedNotes)
      saveNotesToStorage(updatedNotes)
      setNewNote('')
    }
  }

  const editNote = (id: string, newText: string) => {
    const updatedNotes = noteEntries.map(note => 
      note.id === id ? { ...note, text: newText } : note
    )
    setNoteEntries(updatedNotes)
    saveNotesToStorage(updatedNotes)
    setEditingId(null)
  }

  const deleteNote = (id: string) => {
    const updatedNotes = noteEntries.filter(note => note.id !== id)
    setNoteEntries(updatedNotes)
    saveNotesToStorage(updatedNotes)
  }

  const exportNotes = () => {
    const notesText = noteEntries
      .map(note => `${note.timestamp.toLocaleString()}\n${note.text}\n`)
      .join('\n---\n\n')
    
    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reading-notes-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Reading Notes</h3>
              <p className="text-xs text-gray-600">Capture your thoughts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportNotes}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Export Notes"
            >
              <Download size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        
        {/* Add New Note */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Add Note</span>
          </div>
          <div className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your thoughts about what you're reading..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={addNote}
              disabled={!newNote.trim()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Save size={14} />
              Add Note
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Notes ({noteEntries.length})
            </span>
          </div>

          {noteEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No notes yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add your first note above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {noteEntries.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(note.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(note.id)
                          setIsEditing(true)
                        }}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Edit Note"
                      >
                        <Edit3 size={12} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded hover:bg-red-100 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        defaultValue={note.text}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={2}
                        onBlur={(e) => {
                          if (e.target.value.trim() !== note.text) {
                            editNote(note.id, e.target.value.trim())
                          }
                          setEditingId(null)
                          setIsEditing(false)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.metaKey) {
                            editNote(note.id, e.currentTarget.value.trim())
                            setEditingId(null)
                            setIsEditing(false)
                          }
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setIsEditing(false)
                          }
                        }}
                        autoFocus
                      />
                      <div className="text-xs text-gray-500">
                        Press Cmd+Enter to save, Escape to cancel
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {note.text}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Save size={12} />
            <span>Auto-saved</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>Personal notes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
