import { getPartyMembers } from "@/services/parties/members.service";

export async function GET(_req: Request, ctx: RouteContext<"/api/parties/[partyId]/members">) {
    try {
        const { partyId } = await ctx.params;

        if (!partyId) {
            return new Response(JSON.stringify({ error: "Missing party id." }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const result = await getPartyMembers(partyId);

        if (!result.success) {
            return new Response(JSON.stringify({ error: result.error }), { status: result.status, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify(result.members), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (error) {
        console.error("Error fetching party members:", error);
        return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
