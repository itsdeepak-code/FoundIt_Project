import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    console.error('Is mongod running? Try "npm run db" in another terminal.');
    process.exit(1);
  }
}
