import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function check() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log("URI:", MONGODB_URI ? "Defined" : "Undefined");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    
    // Test collection
    const locations = await mongoose.connection.db.collection('locations').find({}).toArray();
    console.log(`Found ${locations.length} locations in db`);
    
    mongoose.disconnect();
  } catch (err) {
    console.error("Failed:", err);
  }
}

check();
