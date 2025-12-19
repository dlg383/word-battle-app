import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";
import { requireAuth } from "@/lib/requireAuth";
import { customAlphabet } from "nanoid";

const createPartySchema = z.object({
    name: z.string().min(1, "Party name is required.").max(50, "Party name must be at most 50 characters."),
});

export async function POST(req: Request) {
    try {
        const session = await requireAuth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        const parsed = createPartySchema.safeParse(body);

        if (!parsed.success) {
            const flattened = z.flattenError(parsed.error);
            return NextResponse.json(
                { error: "Invalid data.", details: flattened.fieldErrors },
                { status: 400 }
            );
        }

        const { name } = parsed.data;

        await dbConnect();

        let accessCode;
        let isUnique = false;

        while (!isUnique) {
            accessCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5)();
            const existing = await Party.findOne({ accessCode });
            if (!existing) {
                isUnique = true;
            }
        }

        const party = await Party.create({
            name,
            ownerId: session.sub,
            accessCode,
            members: [
                {
                    userId: session.sub,
                    userName: name,
                    joinedAt: new Date(),
                },
            ],
            dailyWords: [],
        });

        return NextResponse.json(
            {
                id: String(party._id),
                name: party.name,
                accessCode: party.accessCode,
                ownerId: String(party.ownerId),
                memberCount: party.memberCount,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating party:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
