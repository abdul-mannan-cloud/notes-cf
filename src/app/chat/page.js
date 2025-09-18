"use client"

import { useState, useEffect, useRef } from "react"
import useNotesStore from "@/store/notesStore"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import { PaperAirplaneIcon, MicrophoneIcon } from "@heroicons/react/24/solid"

export default function ChatPage() {
  const { addNote, updateNote, deleteNote } = useNotesStore()
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hello! I can help you manage your notes. Try typing or speaking to me." },
  ])
  const [input, setInput] = useState("")
  const { transcript, listening, resetTranscript } = useSpeechRecognition()
  const chatEndRef = useRef(null)

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support speech recognition. Try Chrome.</p>
  }

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle manual text input
  const handleSend = () => {
    if (!input.trim()) return
    handleUserMessage(input)
    setInput("")
  }

  // Unified message handler
  const handleUserMessage = (content) => {
    const userMessage = { role: "user", content }
    setMessages((prev) => [...prev, userMessage])

    // Mock GPT + tool calls
    const lower = content.toLowerCase()
    let reply = "🤔 I’m not sure what to do with that."

    if (lower.startsWith("add note")) {
      const title = content.replace("add note", "").trim() || "Untitled"
      addNote(title, "This was added via voice/chat")
      reply = `✅ I created a new note titled "${title}".`
    } else if (lower.startsWith("delete note")) {
      deleteNote()
      reply = "🗑️ Deleted the first note."
    } else if (lower.startsWith("edit note")) {
      updateNote(
        useNotesStore.getState().notes[0]?.id,
        { title: "Edited via Voice", description: "This was updated from voice input." }
      )
      reply = "✏️ Updated your first note."
    }

    setMessages((prev) => [...prev, { role: "assistant", content: reply }])
  }

  // Handle transcript after stop
  const handleVoiceStop = () => {
    if (transcript && transcript.trim()) {
      handleUserMessage(transcript)
    }
    resetTranscript()
  }

  return (
    <div className="flex flex-col h-[85vh] max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-white rounded-t-lg">
        <h1 className="text-lg font-semibold text-gray-800">Chat with GPT</h1>
        <p className="text-sm text-gray-500">Type or use voice to manage your notes</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[75%] text-sm ${
                m.role === "assistant"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t bg-white flex items-center gap-2 rounded-b-lg">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
        <button
          onMouseDown={() => SpeechRecognition.startListening({ continuous: true })}
          onMouseUp={() => {
            SpeechRecognition.stopListening()
            handleVoiceStop()
          }}
          className={`p-2 rounded-md text-white ${
            listening ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
