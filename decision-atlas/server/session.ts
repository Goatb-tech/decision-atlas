import { createHash, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { db } from "./db";

const cookieName = "decision_atlas_session";
const durationMs = 24 * 60 * 60 * 1000;

db.exec(`CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
)`);

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readToken(req: Request) {
  const cookie = req.headers.cookie?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  const token = cookie?.slice(cookieName.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api",
};

export function clearSession(req: Request, res: Response) {
  const token = readToken(req);
  if (token) db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").run(hashToken(token));
  res.clearCookie(cookieName, cookieOptions);
}

export function createSession(req: Request, res: Response, userId: string) {
  clearSession(req, res);
  db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(Date.now());
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(hashToken(token), userId, Date.now() + durationMs);
  res.cookie(cookieName, token, { ...cookieOptions, maxAge: durationMs });
}

export function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const row = token ? db.prepare("SELECT user_id FROM auth_sessions WHERE token_hash = ? AND expires_at > ?")
    .get(hashToken(token), Date.now()) : undefined;
  if (!row || typeof row !== "object" || !("user_id" in row) || typeof row.user_id !== "string") {
    res.status(401).json({ error: "Please sign in." });
    return;
  }
  // Reject identities supplied by a caller that differ from the verified session.
  const identities: unknown[] = [req.body?.userId, req.query.userId];
  if (identities.some((id) => id !== undefined && id !== row.user_id)) {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  res.locals.userId = row.user_id;
  next();
}

export function requireSameOrigin(req: Request, res: Response, next: NextFunction) {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const expectedOrigin = process.env.APP_ORIGIN ?? "http://localhost:5173";
    const origin = req.get("origin");
    if ((origin && origin !== expectedOrigin) || req.get("sec-fetch-site") === "cross-site" || !req.is("application/json")) {
      res.status(403).json({ error: "Cross-site request rejected." });
      return;
    }
  }
  next();
}
