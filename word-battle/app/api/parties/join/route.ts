import { NextResponse } from "next/server";
import { z } from "zod";
import { joinParty, type JoinResult } from "@/services/parties/join.service";

const joinPartySchema = z.object({
  accessCode: z
    .string()
    .length(5, "Access code must be 5 characters.")
    .regex(/^[A-Z0-9]{5}$/, "Access code must be uppercase letters and digits."),
  userName: z.string().min(1).max(50).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = joinPartySchema.safeParse({
      userName: typeof body?.userName === "string" ? body.userName.trim() : undefined,
      accessCode:
        typeof body?.accessCode === "string"
          ? body.accessCode.toUpperCase().trim()
          : undefined,
    });

    if (!parsed.success) {
      const flattened = z.flattenError(parsed.error);
      return NextResponse.json(
        { error: "Invalid data.", details: flattened.fieldErrors },
        { status: 400 }
      );
    }

    const { accessCode, userName } = parsed.data;
    const result: JoinResult = await joinParty(accessCode, userName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(result.party, { status: 200 });
  } catch (error) {
    console.error("Error joining party:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
