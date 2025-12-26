import { NextResponse } from "next/server";
import { getOwnedParties, type OwnedResult } from "@/services/parties/owned.service";

export async function GET() {
    const result: OwnedResult = await getOwnedParties();

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    return NextResponse.json({ success: true, parties: result.parties });
}
