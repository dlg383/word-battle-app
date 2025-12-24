import { Schema, model, models, Types } from "mongoose";
import type { Document, Model } from "mongoose";

export interface UserDocument extends Document {
    userName: string;
    email: string;
    passwordHash: string;
    parties: Array<{
        partyId: Types.ObjectId;
        joinedAt: Date;
    }>;
}

const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    parties: [{
        partyId: { type: Schema.Types.ObjectId, ref: 'Party' },
        joinedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export const User = (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);