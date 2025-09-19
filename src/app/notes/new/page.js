"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { createNote } from "@/lib/api";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function AddNotePage() {
    const { loading, user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(()=>{ if(!loading && !user) router.replace("/login"); }, [loading, user, router]);

    const handleSave = async () => {
        if (!title.trim() && !description.trim()) return;
        setBusy(true);
        try {
            await createNote({ title: title || "Untitled", description });
            router.push("/notes");
        } catch(e){ alert(e.message); } finally { setBusy(false); }
    };

    if (loading) return <p>Loading…</p>;
    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto flex flex-col">
            <div className="flex items-center justify-between border-b p-4 bg-white sticky top-0 z-10">
                <button onClick={() => router.push("/notes")} className="text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold">New Note</h1>
                <button onClick={handleSave} disabled={busy} className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                    {busy ? "Saving…" : "Save"}
                </button>
            </div>

            <div className="flex flex-col gap-4 p-4">
                <input className="text-xl font-semibold border-b p-2 outline-none focus:ring-0"
                       value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <textarea className="text-base text-gray-700 resize-none p-2 min-h-[200px] border rounded-md"
                          value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write your note here..." />
            </div>
        </div>
    );
}