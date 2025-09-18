"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSwipeable } from "react-swipeable"
import useNotesStore from "@/store/notesStore"
import { PlusIcon, ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid"


export default function NotesPage() {
  const { notes, deleteNote } = useNotesStore()
  const router = useRouter()
  const [swipedId, setSwipedId] = useState(null)
  const [swipeOffset, setSwipeOffset] = useState({}) // per-note offset

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) +
      " • " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes</h1>
        <div className="flex gap-3">
          {/* Add Note */}
          <button
            onClick={() => router.push("/notes/new")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow transition"
            title="Add Note"
          >
            <PlusIcon className="w-5 h-5" />
          </button>

          {/* Chat */}
          <button
            onClick={() => router.push("/chat")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow transition"
            title="Chat with GPT"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No notes yet. Add one with ➕</p>
      ) : (
        <div className="flex flex-col gap-4">
          {notes.map((note) => {
            const offset = swipeOffset[note.id] || 0
            const isSwiped = swipedId === note.id

            const handlers = useSwipeable({
              onSwiping: (e) => {
                if (e.dir === "Left") {
                  const percent = Math.min(20, Math.abs(e.deltaX) / e.event.target.offsetWidth * 100)
                  setSwipeOffset((prev) => ({ ...prev, [note.id]: -percent }))
                }
                if (e.dir === "Right" && isSwiped) {
                  const percent = Math.min(20, e.deltaX / e.event.target.offsetWidth * 100)
                  setSwipeOffset((prev) => ({ ...prev, [note.id]: -20 + percent }))
                }
              },
              onSwiped: (e) => {
                if (e.dir === "Left") {
                  setSwipedId(note.id)
                  setSwipeOffset((prev) => ({ ...prev, [note.id]: -20 }))
                } else if (e.dir === "Right") {
                  setSwipedId(null)
                  setSwipeOffset((prev) => ({ ...prev, [note.id]: 0 }))
                }
              },
              trackTouch: true,
              trackMouse: true,
            })

            return (
              <div key={note.id} className="relative overflow-hidden" {...handlers}>
                {/* Action Buttons (behind card) */}
                <div className="absolute right-0 top-0 bottom-0 flex">
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="w-20 bg-red-500 text-white flex items-center justify-center"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSwipedId(null)
                      setSwipeOffset((prev) => ({ ...prev, [note.id]: 0 }))
                    }}
                    className="w-20 bg-gray-400 text-white flex items-center justify-center rounded-r-lg"
                  >
                    Cancel
                  </button>
                </div>

                {/* Note Card */}
                <div
                  onClick={() => !isSwiped && router.push(`/notes/${note.id}`)}
                  className="w-full bg-white p-4 rounded-lg shadow transition-transform duration-200 cursor-pointer"
                  style={{
                    transform: `translateX(${offset}%)`,
                  }}
                >
                  <h2 className="text-lg font-semibold">{note.title}</h2>
                  <p className="text-xs text-gray-400 mb-1">{formatDate(note.updatedAt)}</p>
                  <p className="text-gray-600 truncate">{note.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
