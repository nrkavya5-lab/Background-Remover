import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('MongoDB: skipping (no custom URI configured)');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Server will continue without database (auth/history features disabled)');
  }
}
