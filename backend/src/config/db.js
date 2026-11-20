import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] No MONGODB_URI provided in environment. Running in Embedded Resilient Store Mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${error.message}). Falling back to Embedded Resilient Store.`);
    return false;
  }
};

