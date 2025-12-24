import { NextResponse } from "next/server";
import { getJoinedParties, type JoinedResult } from "@/services/parties/joined.service";

export async function GET() {
  try {
    const result: JoinedResult = await getJoinedParties();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    return NextResponse.json({ success: true, parties: result.parties });
  } catch (error) {
    console.error("Error al obtener parties del usuario:", error);
    return NextResponse.json({ error: "Error al obtener las parties" }, { status: 500 });
  }
}
