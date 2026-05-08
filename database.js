import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Create geospatial indexes on startup
    const db = conn.connection.db;
    
    // Ensure issue location index exists
    await db.collection('issues').createIndex({ location: '2dsphere' });
    
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

export default connectDB;
