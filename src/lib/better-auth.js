// lib/better-auth.js
import { createAuth } from 'better-auth';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/bun-sqlite'; // works in node too (or use better-auth's starter)
// If you prefer Postgres, swap to the pg adapter & schema accordingly.

import Database from 'better-sqlite3';

// ---- SQLite setup (dev-friendly). For prod, use Postgres adapter.
const db = new Database('auth.db'); // file in project root
const orm = drizzle(db);

// Basic user/session schema compatible with Better Auth minimal setup
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    passwordHash: text('password_hash'), // Better Auth manages hashing internally
    createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull(),
    revokedAt: text('revoked_at'),
});

// Minimal Better Auth init (email/password)
// (You can add OAuth providers later easily)
export const auth = createAuth({
    db: {
        orm,
        // drizzle + your schema tables; Better Auth can auto-manage or you can use its recipe
        // This inline is illustrative; in real projects use the official adapter helpers if provided.
        // The key is: Better Auth owns users & sessions here (in Next), not in the Worker.
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // set true later & add email sender
    },
    session: {
        cookie: {
            name: 'better-auth.session',
            secure: true,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        },
        // default lifetimes are fine; adjust as you like
    },
});