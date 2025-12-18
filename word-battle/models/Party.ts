import { Schema, model, models, Types } from "mongoose";
import { Member, memberSchema } from "./Member";
import { DailyWord, dailyWordSchema } from "./DailyWord";

export interface PartyDocument extends Document {
    name: string;
    ownerId: Types.ObjectId;
    members: Types.DocumentArray<Member>;
    dailyWords: Types.DocumentArray<DailyWord>;
    memberCount: number;
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

const Party = models.Party || model<PartyDocument>('Party', partySchema);