import { describe, expect, it, beforeAll, afterAll, beforeEach, mock } from "bun:test";
import mongoose from "mongoose";
import { connect, disconnect, clearDatabase } from "@/test/utils/db-handler";
import { Party } from "@/models/Party";
import { createParty } from "@/services/parties/create.service";

const mockUserId = new mongoose.Types.ObjectId().toString();
mock.module("@/lib/requireAuth", () => ({
    requireAuth: () => Promise.resolve({ sub: mockUserId, name: "Anass" }),
}));

mock.module("@/lib/mongodb", () => ({
    dbConnect: () => Promise.resolve(),
}));

describe("Service: createParty (Docker Mode)", () => {
    beforeAll(async () => await connect());
    afterAll(async () => await disconnect());
    beforeEach(async () => await clearDatabase());

    it("debe crear la partida con los requerimientos del modelo", async () => {
        const result = await createParty("Batalla Final");

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.party.ownerId).toBe(mockUserId);

            expect(result.party.accessCode).toHaveLength(5);

            const partyInDb = await Party.findById(result.party.id);
            expect(partyInDb?.members).toHaveLength(1);
            expect(partyInDb?.members[0].userId.toString()).toBe(mockUserId);
        }
    });
});