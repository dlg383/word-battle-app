import { NextResponse } from "next/server";
import { z } from "zod";
import { createParty, type CreatePartyResult } from "@/services/parties/create.service";

const createPartySchema = z.object({
    name: z.string().min(1, "Party name is required.").max(50, "Party name must be at most 50 characters."),
});

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        const parsed = createPartySchema.safeParse(body);

        if (!parsed.success) {
            const flattened = z.flattenError(parsed.error);
            return NextResponse.json(
                { error: "Invalid data.", details: flattened.fieldErrors },
                { status: 400 }
            );
        }

        const { name } = parsed.data;

        const result: CreatePartyResult = await createParty(name);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.status || 400 });
        }

        return NextResponse.json(result.party, { status: 201 });
    } catch (error) {
        console.error("Error creating party:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
