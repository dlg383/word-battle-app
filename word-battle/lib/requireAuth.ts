import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  return { session, error: null };
}
