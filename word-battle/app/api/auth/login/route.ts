import { NextResponse } from "next/server";
import { z } from "zod";
import { loginSchema } from "@/schemas/login.schema";
import { loggued } from "@/services/login/login.service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    const flatteneed = z.flattenError(parsed.error);
    return NextResponse.json({ error: "Invalid data.", details: flatteneed.fieldErrors }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const { success, error } = await loggued(email, password);

  if (!success) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json({ message: "Login successful." }, { status: 201 });
}
