import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    parties: [{
        partyId: { type: Schema.Types.ObjectId, ref: 'Party' },
        joinedAt: { type: Date, default: Date.now }
    }, { timestamps: true }]
})

export const User = models.User || model("User", userSchema);