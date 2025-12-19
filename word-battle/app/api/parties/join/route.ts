import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";
import { requireAuth } from "@/lib/requireAuth";

const joinPartySchema = z.object({
  accessCode: z
    .string()
    .length(5, "Access code must be 5 characters.")
    .regex(/^[A-Z0-9]{5}$/, "Access code must be uppercase letters and digits."),
  userName: z.string().min(1).max(50).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = joinPartySchema.safeParse({
      userName: session.name,
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

    await dbConnect();

    const party = await Party.findOne({ accessCode });
    if (!party) {
      return NextResponse.json({ error: "Party not found." }, { status: 404 });
    }

    const userId = session.sub;
    if (party.isMember(userId)) {
      return NextResponse.json({ error: "User is already a member of this party." }, { status: 400 });
    }

    party.members.push({
      userId,
      userName: userName,
      joinedAt: new Date(),
    });

    await party.save();

    return NextResponse.json(
      {
        id: String(party._id),
        name: party.name,
        accessCode: party.accessCode,
        ownerId: String(party.ownerId),
        memberCount: party.members.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining party:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
