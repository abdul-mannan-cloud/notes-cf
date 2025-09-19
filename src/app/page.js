import Link from "next/link";
import { useAuth } from "./auth/AuthProvider.jsx";

export default function HomePage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">NotesGPT</h1>
            <p className="text-gray-600">Prototype notes app with GPT-Realtime + Cloudflare</p>

            <nav className="flex gap-4">
                <Link href="/notes" className="px-4 py-2 bg-blue-500 text-white rounded-md">Notes</Link>
                <Link href="/chat" className="px-4 py-2 bg-green-500 text-white rounded-md">Chat</Link>
                <Link href="/login" className="px-4 py-2 bg-gray-800 text-white rounded-md">Login</Link>
            </nav>
        </div>
    );
}