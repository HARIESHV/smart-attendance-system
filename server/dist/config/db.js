"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer = null;
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error('MONGODB_URI is not defined in environment variables');
    try {
        // Attempt standard connection with a short timeout
        const conn = await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    }
    catch (err) {
        console.warn('⚠️ Standard MongoDB connection failed. Booting in-memory MongoDB fallback...');
        try {
            mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
            const memUri = mongoServer.getUri();
            const conn = await mongoose_1.default.connect(memUri);
            console.log(`✅ MongoDB Memory Server connected: ${conn.connection.host}`);
        }
        catch (memErr) {
            console.error('❌ MongoDB Memory Server connection error:', memErr);
            throw memErr;
        }
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map