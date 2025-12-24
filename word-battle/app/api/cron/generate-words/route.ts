import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";

async function fetchRandomWord(): Promise<string> {
    const res = await fetch("https://rae-api.com/api/random", {
        headers: { Accept: "application/json" },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`RAE API error: ${res.status} ${res.statusText}`);
    }

    const { data } = await res.json().catch(() => null);

    return data.word.toUpperCase();
}

export async function POST() {
    try {
        await dbConnect();

        const parties = await Party.find({});

        for (const party of parties) {
            const word = await fetchRandomWord();

            const today = new Date().toISOString().split("T")[0];

            const todaysEntry = party.dailyWords.find(
                (dw) => dw.dateScheduled === today
            );

            if (todaysEntry) continue;

            party.dailyWords.push({
                wordToGuess: word,
                dateScheduled: today,
                wordScore: word.length * 10,
                results: [],
            });

            party.markModified("dailyWords");
            await party.save();
        }


        return NextResponse.json({
            parties: parties.map((p) => {
                const hasDailyWords = Array.isArray(p.dailyWords) && p.dailyWords.length > 0;
                const lastDailyWord = hasDailyWords
                    ? p.dailyWords[p.dailyWords.length - 1]
                    : null;

                return {
                    partyId: String(p._id),
                    todaysWord: lastDailyWord ? lastDailyWord.wordToGuess : null,
                    wordScore: lastDailyWord ? lastDailyWord.wordScore : null,
                };
            }),
        });
    } catch (error) {
        console.error("Error generating daily word:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
