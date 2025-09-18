"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import useNotesStore from "@/store/notesStore"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

export default function NoteDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { notes, updateNote } = useNotesStore()

  const note = notes.find((n) => n.id === id)

  const [title, setTitle] = useState(note?.title || "")
  const [description, setDescription] = useState(note?.description || "")

  if (!note) {
    return <p className="text-center mt-20">Note not found.</p>
  }

  const handleSave = () => {
    updateNote(id, { title, description })
    router.push("/notes")
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b p-4 bg-white sticky top-0 z-10">
        <button
          onClick={() => router.push("/notes")}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Edit Note</h1>
        <button
          onClick={handleSave}
          className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Save
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 p-4">
        <input
          className="text-xl font-semibold border-b p-2 outline-none focus:ring-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          className="text-base text-gray-700 resize-none p-2 min-h-[200px] border rounded-md"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your note here..."
        />
      </div>
    </div>
  )
}
