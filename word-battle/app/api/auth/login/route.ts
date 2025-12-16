import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { createSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });

  await createSessionCookie({ sub: String(user._id), email: user.email, name: user.name });

  return NextResponse.json({ id: String(user._id), name: user.name, email: user.email });
}
