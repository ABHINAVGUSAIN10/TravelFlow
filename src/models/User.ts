import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Optional for Google users
  username: { type: String, unique: true, sparse: true }, // Sparse allows null for OAuth users initially
  image: { type: String },
  emailVerified: { type: Date, default: null },
  role: { type: String, default: "user" },
}, { timestamps: true });

// Check if model already exists to prevent overwrite in development
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
