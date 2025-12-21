import { Schema, model, models, Types } from "mongoose";
import type { Document, Model } from "mongoose";
import { Member, memberSchema } from "./Member";
import { DailyWord, dailyWordSchema } from "./DailyWord";

export interface PartyDocument extends Document {
    name: string;
    ownerId: Types.ObjectId;
    members: Types.DocumentArray<Member>;
    dailyWords: Types.DocumentArray<DailyWord>;
    memberCount: number;
    accessCode: string;
    createdAt: Date;
    updatedAt: Date;
    isMember(userId: Types.ObjectId | string): boolean;
}

const partySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessCode: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 5
    },
    members: [memberSchema],
    dailyWords: [dailyWordSchema]
}, {
    timestamps: true
});

partySchema.index({ ownerId: 1 });
partySchema.index({ 'members.userId': 1 });
partySchema.index({ 'dailyWords.dateScheduled': 1 });

partySchema.virtual('memberCount').get(function () {
    return this.members.length;
});

partySchema.methods.isMember = function (this: PartyDocument, userId: Types.ObjectId | string) {
    return this.members.some((m) => m.userId.equals(userId));
};

export const Party = (models.Party as Model<PartyDocument>) || model<PartyDocument>("Party", partySchema);