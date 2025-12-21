import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { requireAuth } from "@/lib/requireAuth";
import { Party } from "@/models/Party";
import { Types } from "mongoose";

type LetterState = "correct" | "present" | "incorrect";

function evaluateGuess(targetRaw: string, guessRaw: string): LetterState[] {
    const target = targetRaw.toUpperCase().trim();
    const guess = guessRaw.toUpperCase().trim();

    const n = target.length;
    const result: LetterState[] = Array(n).fill("incorrect");

    const counts: Record<string, number> = {};

    for (let i = 0; i < n; i++) {
        const t = target[i];
        const g = guess[i];
        if (t === g) {
            result[i] = "correct";
        } else {
            counts[t] = (counts[t] || 0) + 1;
        }
    }

    for (let i = 0; i < n; i++) {
        if (result[i] === "correct") continue;
        const g = guess[i];
        if (counts[g] && counts[g] > 0) {
            result[i] = "present";
            counts[g]--;
        } else {
            result[i] = "incorrect";
        }
    }

    return result;
}

const guessSchema = z.object({
    word: z.string().min(1, "Word is required."),
});

export async function POST(
    request: Request,
    ctx: RouteContext<"/api/parties/[partyId]/guess">
) {
    try {
        const session = await requireAuth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = guessSchema.safeParse(body ?? {});

        if (!parsed.success) {
            const flattened = z.flattenError(parsed.error);
            return NextResponse.json(
                { error: "Invalid data.", details: flattened.fieldErrors },
                { status: 400 }
            );
        }

        const { word } = parsed.data;

        await dbConnect();

        const { partyId } = await ctx.params;

        const party = await Party.findById(partyId);
        if (!party) {
            return NextResponse.json({ error: "Party not found." }, { status: 404 });
        }

        const userId = session.sub;
        if (!party.isMember(userId)) {
            return NextResponse.json({ error: "User is not a member of this party." }, { status: 403 });
        }

        const today = new Date().toISOString().split("T")[0];

        const todaysEntry = party.dailyWords.find(
            (dw) => dw.dateScheduled === today
        );

        if (!todaysEntry) {
            return NextResponse.json({ error: "No daily word available for this party." }, { status: 404 });
        }

        const target = todaysEntry.wordToGuess;

        const letters = evaluateGuess(target, word);

        const guessed = letters.every(s => s === "correct");
        let user = todaysEntry.results.find(r => r.userId.equals(userId));

        if (!user) {
            todaysEntry.results.push({
                userId: new Types.ObjectId(userId),
                userName: session.name,
                attemptsCount: 0,
                pointsEarned: 0,
            });
            user = todaysEntry.results[todaysEntry.results.length - 1];
        }

        user.attemptsCount += 1;
        user.pointsEarned = guessed ? todaysEntry.wordScore / user.attemptsCount : 0;

        party.markModified("dailyWords");
        await party.save();

        return NextResponse.json({
            guessed,
            attempts: user.attemptsCount,
            letters,
        });
    } catch (error) {
        console.error("Error checking guess:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

