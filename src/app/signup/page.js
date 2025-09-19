"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function SignupPage() {
    const { signUpEmail } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await signUpEmail(email, password, name);
            router.replace("/notes");
        } catch (e2) {
            setErr(e2.message || "Signup failed");
        }
    };

    return (
        <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Create account</h1>
            {err && <p className="text-red-600 mb-3 text-sm">{err}</p>}
            <form onSubmit={submit} className="flex flex-col gap-3">
                <input className="border rounded p-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
                <input className="border rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input className="border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                <button className="bg-blue-600 text-white rounded p-2">Sign up</button>
            </form>
            <p className="mt-4 text-sm">
                Already have an account? <a href="/login" className="text-blue-600 underline">Sign in</a>
            </p>
        </div>
    );
}