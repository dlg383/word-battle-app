import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Party } from "@/models/Party";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
    try {
        const session = await requireAuth();

        if (!session) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        await dbConnect();

        const parties = await Party.find({
            "members.userId": session.sub
        })
            .select("name ownerId accessCode members createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            parties: parties.map(party => ({
                id: party._id,
                name: party.name,
                ownerId: party.ownerId,
                accessCode: party.accessCode,
                memberCount: party.members.length,
                createdAt: party.createdAt,
                updatedAt: party.updatedAt
            }))
        });
    } catch (error) {
        console.error("Error al obtener parties del usuario:", error);
        return NextResponse.json(
            { error: "Error al obtener las parties" },
            { status: 500 }
        );
    }
}
