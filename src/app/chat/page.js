"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { createNote, semanticSearch } from "@/lib/api";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { PaperAirplaneIcon, MicrophoneIcon } from "@heroicons/react/24/solid";

export default function ChatPage() {
    const { loading, user } = useAuth();
    const [messages, setMessages] = useState([
        { role: "assistant", content: "👋 Hello! I can help you manage your notes. Try typing or speaking to me." },
    ]);
    const [input, setInput] = useState("");
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const chatEndRef = useRef(null);

    useEffect(()=>{ if(!loading && !user) window.location.href="/login"; }, [loading, user]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const reply = (text) => setMessages((p) => [...p, { role: "assistant", content: text }]);

    const handleUserMessage = async (content) => {
        const userMessage = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);

        const lower = content.toLowerCase();
        try {
            if (lower.startsWith("add note")) {
                const title = content.replace(/^add note/i, "").trim() || "Untitled";
                await createNote({ title, description: "" });
                reply(`✅ Created a new note "${title}".`);
            } else if (lower.startsWith("search")) {
                const q = content.replace(/^search/i, "").trim();
                const res = await semanticSearch(q);
                const lines = res.matches?.map(m => `• ${m.title} (${m.score?.toFixed?.(3)})`).join("\n") || "No matches.";
                reply(`🔎 Results for "${q}":\n${lines}`);
            } else {
                reply("🤔 Try: 'add note <title>' or 'search <query>'.");
            }
        } catch (e) {
            reply(`❗ Error: ${e.message}`);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        handleUserMessage(input);
        setInput("");
    };

    const handleVoiceStop = () => {
        if (transcript && transcript.trim()) handleUserMessage(transcript);
        resetTranscript();
    };

    if (loading) return <p>Loading…</p>;
    if (!user) return null;

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return <p>Your browser does not support speech recognition. Try Chrome.</p>;
    }

    return (
        <div className="flex flex-col h-[85vh] max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
            <div className="p-4 border-b bg-white rounded-t-lg">
                <h1 className="text-lg font-semibold text-gray-800">Chat with GPT</h1>
                <p className="text-sm text-gray-500">Type or use voice to manage your notes</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                        <div className={`px-4 py-2 rounded-lg max-w-[75%] text-sm ${m.role === "assistant" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2 rounded-b-lg">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Type your message..."
                />
                <button onClick={handleSend} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
                <button
                    onMouseDown={() => SpeechRecognition.startListening({ continuous: true })}
                    onMouseUp={() => { SpeechRecognition.stopListening(); handleVoiceStop(); }}
                    className={`p-2 rounded-md text-white ${listening ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"}`}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}