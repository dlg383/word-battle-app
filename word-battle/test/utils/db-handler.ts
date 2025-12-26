import mongoose from 'mongoose';

const TEST_DB_URI = "mongodb://root:example@127.0.0.1:27018/word-battle-test?authSource=admin";

export const connect = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 10000 });
    }
};

export const disconnect = async () => {
    await mongoose.connection.close();
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};