import mongoose from "mongoose";
import Location from "../src/models/Location";
import { locations } from "./locationData";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/travelflow";

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  console.log("🗑️  Clearing existing locations...");
  await Location.deleteMany({});

  console.log(`📍 Inserting ${locations.length} locations...`);
  const result = await Location.insertMany(locations);
  console.log(`✅ Successfully inserted ${result.length} locations!\n`);

  // Print summary by category
  const categories = [...new Set(locations.map((l) => l.category))];
  console.log("📊 Summary by category:");
  for (const cat of categories) {
    const count = locations.filter((l) => l.category === cat).length;
    console.log(`   ${cat}: ${count}`);
  }

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected. Seeding complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
