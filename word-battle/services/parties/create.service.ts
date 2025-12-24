import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";
import { requireAuth } from "@/lib/requireAuth";
import { customAlphabet } from "nanoid";

export type CreatePartyResult =
  | { success: true; party: { id: string; name: string; accessCode: string; ownerId: string; memberCount: number } }
  | { success: false; status: number; error: string };

export async function createParty(name: string): Promise<CreatePartyResult> {
  try {
    const session = await requireAuth();
    if (!session) return { success: false, status: 401, error: "Unauthorized" };

    try {
      await dbConnect();
    } catch (dbError) {
      console.error("DB connection failed:", dbError);
      return { success: false, status: 500, error: "Database connection failed." };
    }

    let accessCode = "";
    let isUnique = false;
    const gen = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5);

    while (!isUnique) {
      accessCode = gen();
      const existing = await Party.findOne({ accessCode });
      if (!existing) isUnique = true;
    }

    const party = await Party.create({
      name,
      ownerId: session.sub,
      accessCode,
      members: [
        {
          userId: session.sub,
          userName: session.name,
          joinedAt: new Date(),
        },
      ],
      dailyWords: [],
    });

    return {
      success: true,
      party: {
        id: String(party._id),
        name: party.name,
        accessCode: party.accessCode,
        ownerId: String(party.ownerId),
        memberCount: party.memberCount,
      },
    };
  } catch (error) {
    console.error("Error creating party in service:", error);
    return { success: false, status: 500, error: "Internal server error." };
  }
}
