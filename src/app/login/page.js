"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function LoginPage() {
    const { loading, user, signInEmail, signInAnon } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    if (!loading && user) router.replace("/notes");

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await signInEmail(email, password);
            router.replace("/notes");
        } catch (e2) {
            setErr(e2.message || "Login failed");
        }
    };

    return (
        <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {err && <p className="text-red-600 mb-3 text-sm">{err}</p>}
            <form onSubmit={submit} className="flex flex-col gap-3">
                <input className="border rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input className="border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                <button className="bg-blue-600 text-white rounded p-2">Sign in</button>
            </form>
            <button onClick={async()=>{await signInAnon(); router.replace("/notes");}} className="mt-3 bg-gray-800 text-white rounded p-2 w-full">
                Continue as guest
            </button>
            <p className="mt-4 text-sm">
                No account? <a href="/signup" className="text-blue-600 underline">Create one</a>
            </p>
        </div>
    );
}