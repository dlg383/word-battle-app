import { NextResponse } from "next/server";
import { getPartyLeaderboard, type LeaderboardResult } from "@/services/parties/leaderboard.service";

export async function GET(_req: Request, ctx: RouteContext<"/api/parties/[partyId]/leaderboard">) {
    try {
        const { partyId } = await ctx.params;

        if (!partyId) {
            return NextResponse.json({ error: "Missing party id." }, { status: 400 });
        }

        const result: LeaderboardResult = await getPartyLeaderboard(partyId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }

        return NextResponse.json({ success: true, leaderboard: result.leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
