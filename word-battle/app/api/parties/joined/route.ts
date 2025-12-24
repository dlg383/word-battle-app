import { NextResponse } from "next/server";
import { getJoinedParties, type JoinedResult } from "@/services/parties/joined.service";

export async function GET() {
    const result: JoinedResult = await getJoinedParties();

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    return NextResponse.json({ success: true, parties: result.parties });
}
