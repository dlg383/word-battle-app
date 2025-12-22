"use server"

import { redirect } from "next/navigation";
import { clientEnv } from "@/env";
import { cookies } from 'next/headers'
import { COOKIE_NAME } from "@/lib/auth";

export async function login(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  

  try {
      const res = await fetch(`${clientEnv.env.NEXT_PUBLIC_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const user = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { error: user?.error || "Login failed" };
      }

      const setCookieHeader = res.headers.get("set-cookie");
    
      if (setCookieHeader) {
        // Extraemos el valor del token (la parte entre 'session=' y el ';')
        const token = setCookieHeader.split(';')[0].split('=')[1];
        
        const cookieStore = await cookies();
        cookieStore.set("session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 604800, // 7 días (coincidiendo con tu log)
        });
      }

    } catch (e) {
      console.log(e);
    }
}