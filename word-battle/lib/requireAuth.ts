import { getSession } from "@/lib/auth";

export async function requireAuth() {
  const session = await getSession();
  return session;
}
