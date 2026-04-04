import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Username too short" }, { status: 400 });
    }

    await dbConnect();

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Update the user
    await User.findOneAndUpdate(
      { email: session.user.email },
      { username: username }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup username error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
