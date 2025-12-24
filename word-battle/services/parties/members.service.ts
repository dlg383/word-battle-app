import { dbConnect } from "@/lib/mongodb";
import { isValidObjectId } from "mongoose";
import { Party as PartyModel } from "@/models/Party";
import type { Member } from "@/models/Member";

export type PartyMemberInfo = {
  id: string;
  userName: string;
  joinedAt?: Date;
};

export type GetPartyMembersResult =
  | { success: true; members: PartyMemberInfo[] }
  | { success: false; status: number; error: string };

export async function getPartyMembers(partyId: string): Promise<GetPartyMembersResult> {
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

    const party = await PartyModel.findById(partyId).select("members");
    if (!party) {
      return { success: false, status: 404, error: "Party not found." };
    }

    const members: PartyMemberInfo[] = party.members.map((m: Member) => ({
      id: String(m.userId),
      userName: m.userName,
      joinedAt: m.joinedAt,
    }));

    return { success: true, members };
  } catch (error) {
    console.error("Error fetching party members in service:", error);
    return { success: false, status: 500, error: "Internal server error." };
  }
}
