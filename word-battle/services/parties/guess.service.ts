import { DailyWord } from "@/models/DailyWord";
import { Party } from "@/models/Party";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongodb";

export async function guessWord(partyId: string, word: string, userId: string, username: string) {
    try {
        await dbConnect();
    } catch (dbError) {
        console.error("DB connection failed:", dbError);
        return { success: false, error: "Database connection failed.", guessed: false, attempts: null, letters: null };
    }

    const party = await Party.findById(partyId);
    if (!party) {
        return { success: false, error: "Party not found.", guessed: false, attempts: null, letters: null };
    }

    if (!party.isMember(userId)) {
        return { success: false, error: "User is not a member of this party.", guessed: false, attempts: null, letters: null };
    }

    const { success: dailyWordSuccess, error: dailyWordError, dailyWord } = await dailyWordIsAvailable(party.dailyWords);

    if (!dailyWordSuccess || !dailyWord) {
        return { success: false, error: dailyWordError, guessed: false, attempts: null, letters: null };
    }

    const target = dailyWord.wordToGuess;

    const letters = evaluateGuess(target, word);

    const guessed = letters.every(s => s === "correct");
    let user = dailyWord.results.find(r => r.userId.equals(userId));

    if (!user) {
        dailyWord.results.push({
            userId: new Types.ObjectId(userId),
            userName: username,
            attemptsCount: 0,
            pointsEarned: 0,
        });
        user = dailyWord.results[dailyWord.results.length - 1];
    }

    user.attemptsCount += 1;
    user.pointsEarned = guessed ? dailyWord.wordScore / user.attemptsCount : 0;

    party.markModified("dailyWords");
    await party.save();
    return { success: true, error: null, guessed, attempts: user.attemptsCount, letters };
}


export async function dailyWordIsAvailable(dailyWords: DailyWord[]) {
    const today = new Date().toISOString().split("T")[0];

    const todaysEntry = dailyWords.find(
        (dw) => dw.dateScheduled === today
    );

    if (!todaysEntry) {
        return { success: false, error: "No daily word available for this party.", dailyWord: null };
    }

    return { success: true, error: null, dailyWord: todaysEntry };
}

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