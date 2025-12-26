import { dbConnect } from "@/lib/mongodb";
import { isValidObjectId } from "mongoose";
import { Party as PartyModel } from "@/models/Party";

export type PartyInfo = {
    id: string;
    name: string;
    accessCode: string;
    ownerId: string;
    memberCount: number;
    members: { id: string; userName: string; joinedAt?: Date }[];
    dailyWords: { dateScheduled: string; wordScore: number }[];
    createdAt: Date;
    updatedAt: Date;
};

export type GetPartyResult =
    | { success: true; party: PartyInfo }
    | { success: false; status: number; error: string };

export async function getParty(partyId: string): Promise<GetPartyResult> {
    try {
        if (!isValidObjectId(partyId)) {
            return { success: false, status: 400, error: "Invalid party id." };
        }

        try {
            await dbConnect();
        } catch (dbError) {
            console.error("DB connection failed:", dbError);
            return { success: false, status: 500, error: "Database connection failed." };
        }

        const party = await PartyModel.findById(partyId);

        if (!party) {
            return { success: false, status: 404, error: "Party not found." };
        }

        const mapped: PartyInfo = {
            id: String(party._id),
            name: party.name,
            accessCode: party.accessCode,
            ownerId: String(party.ownerId),
            memberCount: party.memberCount,
            members: party.members.map((m) => ({ id: String(m.userId), userName: m.userName, joinedAt: m.joinedAt })),
            dailyWords: party.dailyWords.map((d) => ({ dateScheduled: d.dateScheduled, wordScore: d.wordScore })),
            createdAt: party.createdAt,
            updatedAt: party.updatedAt,
        };

        return { success: true, party: mapped };
    } catch (error) {
        console.error("Error fetching party in service:", error);
        return { success: false, status: 500, error: "Internal server error." };
    }
}
