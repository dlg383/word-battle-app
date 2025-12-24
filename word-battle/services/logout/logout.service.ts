import { COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function logout() {
    const cookie = await cookies();

    cookie.set(COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

    return { ok: true };
} 