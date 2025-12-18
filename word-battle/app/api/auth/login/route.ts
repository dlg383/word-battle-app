import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createSessionCookie, SessionPayload } from "@/lib/auth";

const schema = z.object({
  email: z.email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const flatteneed = z.flattenError(parsed.error);
    return NextResponse.json({ error: "Invalid data.", details: flatteneed.fieldErrors }, { status: 400 });
  }

  const { email, password } = parsed.data;

  await dbConnect();
  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!user || !ok) return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });

  const session: SessionPayload = { sub: String(user._id), email: user.email, name: user.name };
  await createSessionCookie(session);

  return NextResponse.json({ id: session.sub, name: session.name, email: session.email });
}
