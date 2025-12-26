import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";
import { requireAuth } from "@/lib/requireAuth";

export type OwnedParty = {
    id: string;
    name: string;
    ownerId: string;
    accessCode: string;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
};

export type OwnedResult =
    | { success: true; parties: OwnedParty[] }
    | { success: false; status: number; error: string };

export async function getOwnedParties(): Promise<OwnedResult> {
    try {
        const session = await requireAuth();
        if (!session) return { success: false, status: 401, error: "Unauthorized" };

        try {
            await dbConnect();
        } catch (dbError) {
            console.error("DB connection failed:", dbError);
            return { success: false, status: 500, error: "Database connection failed." };
        }

        const parties = await Party.find({ ownerId: session.sub })
            .select("name ownerId accessCode members createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        const mapped = parties.map((party) => ({
            id: String(party._id),
            name: party.name,
            ownerId: String(party.ownerId),
            accessCode: party.accessCode,
            memberCount: party.members.length,
            createdAt: party.createdAt,
            updatedAt: party.updatedAt,
        }));

        return { success: true, parties: mapped };
    } catch (error) {
        console.error("Error getting owned parties:", error);
        return { success: false, status: 500, error: "Error retrieving parties" };
    }
}
