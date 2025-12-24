import { NextResponse } from "next/server";
import { getParty } from "@/services/parties/get.service";

export async function GET(_req: Request, ctx: RouteContext<"/api/parties/[partyId]">) {
    try {
        const { partyId } = await ctx.params;

        if (!partyId) {
            return NextResponse.json({ error: "Missing party id." }, { status: 400 });
        }

        const result = await getParty(partyId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.party, { status: 200 });
    } catch (error) {
        console.error("Error fetching party:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
