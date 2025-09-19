"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    authGetSession,
    authSignInEmail,
    authSignUpEmail,
    authSignOut,
    authSignInAnonymous,
} from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authGetSession();
            if (data?.user && data?.session) {
                setUser(data.user);
                setSession(data.session);
            } else {
                setUser(null);
                setSession(null);
            }
        } catch {
            setUser(null);
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const signInEmail = async (email, password) => {
        await authSignInEmail({ email, password });
        await refresh();
    };

    const signUpEmail = async (email, password, name) => {
        await authSignUpEmail({ email, password, name });
        await refresh();
    };

    const signInAnon = async () => {
        await authSignInAnonymous();
        await refresh();
    };

    const signOut = async () => {
        await authSignOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthCtx.Provider
            value={{ user, session, loading, refresh, signInEmail, signUpEmail, signInAnon, signOut }}
        >
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}