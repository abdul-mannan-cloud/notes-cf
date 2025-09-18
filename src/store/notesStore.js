import { create } from "zustand"

const useNotesStore = create((set) => ({
  notes: [],
  addNote: (title, description) =>
    set((state) => {
      const newNote = {
        id: Date.now().toString(),
        title,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return { notes: [newNote, ...state.notes] }
    }),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      ),
    })),
  deleteNote: (id) =>
    set((state) => {
        if (!id && state.notes.length > 0) {
        // default: delete first note
        id = state.notes[0].id
        }
        return { notes: state.notes.filter((note) => note.id !== id) }
    }),
}))

export default useNotesStore
