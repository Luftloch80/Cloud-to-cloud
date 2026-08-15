import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionData } from "./types";

const COOKIE_NAME = "meridian_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET || "meridian-dev-secret-change-in-production-32";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSession(): Promise<SessionData | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function writeSession(data: SessionData) {
  const token = await createSessionToken(data);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function updateSession(patch: Partial<SessionData>) {
  const current = (await readSession()) || { createdAt: Date.now() };
  const next: SessionData = {
    ...current,
    ...patch,
    createdAt: current.createdAt || Date.now(),
  };
  await writeSession(next);
  return next;
}

export function isDemoModeAllowed() {
  return process.env.ALLOW_DEMO_MODE === "true" || !process.env.APPLE_CLIENT_ID;
}
