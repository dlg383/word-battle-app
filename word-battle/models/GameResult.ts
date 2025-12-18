import { Schema, Types } from "mongoose";

export interface GameResult {
    userId: Types.ObjectId;
    userName: string;
    attemptsCount: number;
    pointsEarned: number;
    completedAt?: Date;
}

export const gameResultSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    attemptsCount: {
        type: Number,
        required: true,
        default: 0,
    },
    pointsEarned: {
        type: Number,
        required: true,
        min: 0
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });