import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  try {
    // Attempt standard connection with a short timeout
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn('⚠️ Standard MongoDB connection failed. Booting in-memory MongoDB fallback...');
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ MongoDB Memory Server connected: ${conn.connection.host}`);
    } catch (memErr) {
      console.error('❌ MongoDB Memory Server connection error:', memErr);
      throw memErr;
    }
  }
};
