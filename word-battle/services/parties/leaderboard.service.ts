import { dbConnect } from "@/lib/mongodb";
import { isValidObjectId, Types, PipelineStage } from "mongoose";
import { Party as PartyModel } from "@/models/Party";

export type LeaderboardEntry = {
    userId: string;
    userName: string;
    totalPoints: number;
    totalAttempts: number;
    gamesPlayed: number;
    lastPlayedAt?: Date;
};

export type LeaderboardResult =
    | { success: true; leaderboard: LeaderboardEntry[] }
    | { success: false; status: number; error: string };

export async function getPartyLeaderboard(partyId: string): Promise<LeaderboardResult> {
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

        const objectId = new Types.ObjectId(partyId);
        const exists = await PartyModel.exists({ _id: objectId });
        if (!exists) {
            return { success: false, status: 404, error: "Party not found." };
        }

        // Use MongoDB aggregation for better performance and to avoid client-side looping
        const pipeline: PipelineStage[] = [
            { $match: { _id: objectId } },
            { $unwind: { path: "$dailyWords" } },
            { $unwind: { path: "$dailyWords.results" } },
            {
                $group: {
                    _id: "$dailyWords.results.userId",
                    userName: { $first: "$dailyWords.results.userName" },
                    totalPoints: { $sum: { $ifNull: ["$dailyWords.results.pointsEarned", 0] } },
                    totalAttempts: { $sum: { $ifNull: ["$dailyWords.results.attemptsCount", 0] } },
                    gamesPlayed: { $sum: 1 },
                    lastPlayedAt: { $max: "$dailyWords.results.completedAt" }
                }
            },
            { $sort: { totalPoints: -1, totalAttempts: 1, lastPlayedAt: -1 } }
        ];

        type AggRow = {
            _id: Types.ObjectId;
            userName?: string;
            totalPoints?: number;
            totalAttempts?: number;
            gamesPlayed?: number;
            lastPlayedAt?: Date | string;
        };

        const rows = (await PartyModel.aggregate(pipeline)) as AggRow[];

        const leaderboard: LeaderboardEntry[] = rows.map((r) => ({
            userId: String(r._id),
            userName: r.userName ?? "Unknown",
            totalPoints: Number(r.totalPoints ?? 0),
            totalAttempts: Number(r.totalAttempts ?? 0),
            gamesPlayed: Number(r.gamesPlayed ?? 0),
            lastPlayedAt: r.lastPlayedAt ? new Date(r.lastPlayedAt) : undefined,
        }));

        return { success: true, leaderboard };
    } catch (error) {
        console.error("Error generating leaderboard:", error);
        return { success: false, status: 500, error: "Internal server error." };
    }
}
