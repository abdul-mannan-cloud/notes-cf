// lib/api.js

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

let bearerToken = null;
let tokenExpiresAt = 0; // epoch seconds

async function json(res) {
    if (!res.ok) {
        let errText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${errText ? `- ${errText}` : ""}`);
    }
    const txt = await res.text();
    return txt ? JSON.parse(txt) : null;
}

// --- Auth endpoints (cookie-based; include credentials) ---
export async function authGetSession() {
    const res = await fetch(`${API_BASE}/api/auth/get-session`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await json(res);
    return data; // { user, session } or null
}

export async function authSignUpEmail({ email, password, name }) {
    const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, name }),
    });
    return json(res);
}

export async function authSignInEmail({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return json(res);
}

export async function authSignInAnonymous() {
    const res = await fetch(`${API_BASE}/api/auth/sign-in/anonymous`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
    });
    return json(res);
}

export async function authSignOut() {
    const res = await fetch(`${API_BASE}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
    });
    return json(res);
}

// --- Issue short-lived API token used for protected routes ---
async function issueBearer() {
    const res = await fetch(`${API_BASE}/auth/issue`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
    });
    const data = await json(res); // { token, expiresIn }
    bearerToken = data.token;
    const now = Math.floor(Date.now() / 1000);
    tokenExpiresAt = now + Math.max(0, (data.expiresIn ?? 120) - 15); // refresh a bit early
}

// Always make sure we have a valid Bearer before calling protected APIs
async function ensureBearer() {
    const now = Math.floor(Date.now() / 1000);
    if (!bearerToken || now >= tokenExpiresAt) {
        await issueBearer();
    }
}

async function authedFetch(path, init = {}, retry = true) {
    await ensureBearer();
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${bearerToken}`,
            "content-type": init.body && !init.headers?.["content-type"] ? "application/json" : (init.headers?.["content-type"] || undefined),
        },
    });

    if (res.status === 401 && retry) {
        // token may be expired/revoked → re-issue once and retry
        bearerToken = null;
        tokenExpiresAt = 0;
        await ensureBearer();
        return authedFetch(path, init, false);
    }
    return res;
}

// --- Notes API (protected) ---
export async function listNotes() {
    const res = await authedFetch("/api/notes");
    return json(res);
}

export async function getNote(id) {
    const url = `/api/notes?id=${encodeURIComponent(id)}`;
    const res = await authedFetch(url);
    return json(res);
}

export async function createNote({ title, description }) {
    const res = await authedFetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({ title, description }),
    });
    return json(res);
}

export async function updateNote({ id, title, description }) {
    const res = await authedFetch("/api/notes", {
        method: "PUT",
        body: JSON.stringify({ id, title, description }),
    });
    return json(res);
}

export async function deleteNote(id) {
    const url = `/api/notes?id=${encodeURIComponent(id)}`;
    const res = await authedFetch(url, { method: "DELETE" });
    return json(res);
}

// --- Vector search (protected) ---
export async function semanticSearch(query) {
    const res = await authedFetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
    });
    return json(res);
}