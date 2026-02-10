import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      retryWrites: true,
      w: 'majority'
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`Error Code: ${error.code || 'N/A'}`);
    
    if (error.code === 102 || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Connection Troubleshooting:');
      console.error('1. Check if MongoDB Atlas cluster is running');
      console.error('2. Verify your IP address is whitelisted in MongoDB Atlas');
      console.error('3. Check your internet connection');
      console.error('4. Verify the MONGODB_URI in your .env file');
      console.error('\nTo whitelist your IP in MongoDB Atlas:');
      console.error('- Go to Network Access → Add IP Address → Add Current IP Address');
    }
    
    process.exit(1);
  }
};

export default connectDB;
