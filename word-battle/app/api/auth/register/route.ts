import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
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

  const { name, email, password } = parsed.data;

  await dbConnect();
  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  await createSessionCookie({ sub: String(user._id), email: user.email, name: user.name });

  return NextResponse.json({ id: String(user._id), name: user.name, email: user.email });
}