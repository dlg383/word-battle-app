import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { serverEnv } from "@/env";

export const COOKIE_NAME = "session";
const secret = new TextEncoder().encode(serverEnv.env.JWT_SECRET);

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("DEBUG: JWT verification failed:", error);
    }
    return null;
  }
}