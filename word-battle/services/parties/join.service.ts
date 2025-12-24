import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";
import { requireAuth } from "@/lib/requireAuth";
import { z } from "zod";

const joinPartySchema = z.object({
    accessCode: z
        .string()
        .length(5, "Access code must be 5 characters")
        .regex(/^[A-Z0-9]{5}$/, "Access code must be uppercase letters and digits."),
    userName: z.string().min(1).max(50).optional(),
});

export type JoinResult =
    | { success: true; party: { id: string; name: string; accessCode: string; ownerId: string; memberCount: number } }
    | { success: false; status: number; error: string; details?: Record<string, string[] | undefined> };

export async function joinParty(accessCode?: string, userName?: string): Promise<JoinResult> {
    const parsed = joinPartySchema.safeParse({ accessCode, userName });
    if (!parsed.success) {
        const flattened = z.flattenError(parsed.error);
        return { success: false, status: 400, error: "Invalid data.", details: flattened.fieldErrors };
    }

    try {
        await dbConnect();
    } catch (dbError) {
        console.error("DB connection failed:", dbError);
        return { success: false, status: 500, error: "Database connection failed." };
    }

    const session = await requireAuth();
    if (!session) return { success: false, status: 401, error: "Unauthorized" };

    const { accessCode: code } = parsed.data;

    const party = await Party.findOne({ accessCode: code });
    if (!party) return { success: false, status: 404, error: "Party not found." };

    const userId = session.sub;

    if (party.isMember(userId)) {
        return { success: false, status: 400, error: "User is already a member of this party." };
    }

    const finalUserName = parsed.data.userName ?? session.name;

    party.members.push({
        userId,
        userName: finalUserName,
        joinedAt: new Date(),
    });

    await party.save();

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
}
