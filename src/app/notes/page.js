"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider.jsx";
import { listNotes, deleteNote } from "@/lib/api";
import { PlusIcon, ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";

export default function NotesPage() {
    const { loading, user, signOut } = useAuth();
    const router = useRouter();
    const [notes, setNotes] = useState([]);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!loading && !user) router.replace("/login");
    }, [loading, user, router]);

    useEffect(() => {
        if (loading || !user) return;
        (async () => {
            try { setNotes(await listNotes()); } catch(e){ setErr(e.message); }
        })();
    }, [loading, user]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return (
            d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) +
            " • " +
            d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
    };

    const doDelete = async (id) => {
        setBusy(true);
        try {
            await deleteNote(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <p>Loading…</p>;
    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Notes</h1>
                <div className="flex gap-3">
                    <button onClick={() => router.push("/notes/new")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => router.push("/chat")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                    </button>
                    <button onClick={signOut} className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                        Logout
                    </button>
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            {notes.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">No notes yet. Add one with ➕</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {notes.map((note) => (
                        <div key={note.id} className="relative overflow-hidden">
                            <div
                                onClick={() => router.push(`/notes/${note.id}`)}
                                className="w-full bg-white p-4 rounded-lg shadow cursor-pointer"
                            >
                                <h2 className="text-lg font-semibold">{note.title}</h2>
                                <p className="text-xs text-gray-400 mb-1">{formatDate(note.updatedAt)}</p>
                                <p className="text-gray-600 truncate">{note.description}</p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    disabled={busy}
                                    onClick={() => doDelete(note.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}