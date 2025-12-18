import { Schema, Types } from "mongoose";

export interface Member {
    userId: Types.ObjectId;
    userName: string;
    joinedAt?: Date;
}

export const memberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });