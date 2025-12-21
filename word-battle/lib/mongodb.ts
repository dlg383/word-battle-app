import { serverEnv } from "@/env";
import mongoose, { Mongoose } from "mongoose";

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
    const MONGODB_URI = serverEnv.env.MONGODB_URI;

    if (cached!.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts: mongoose.ConnectOptions = {
            dbName: "word-battle",
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}