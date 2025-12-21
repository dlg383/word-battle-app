import { Schema } from "mongoose";
import { GameResult, gameResultSchema } from "./GameResult";

export interface DailyWord {
    wordToGuess: string;
    dateScheduled: string;
    wordScore: number;
    results: GameResult[];
}

export const dailyWordSchema = new Schema({
    wordToGuess: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    dateScheduled: {
        type: String,
        required: true
    },
    wordScore: {
        type: Number,
        min: 0
    },
    results: [gameResultSchema]
}, { _id: true });