import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/requireAuth";
import { guessWord } from "@/services/parties/guess.service";

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

        const { partyId } = await ctx.params;

        const { success, error, guessed, attempts, letters } = await guessWord(partyId, word, session.sub, session.name);

        if (!success) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({
            guessed,
            attempts,
            letters,
        });
    } catch (error) {
        console.error("Error checking guess:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

