import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, image } = await req.json();
    const updateData: Record<string, string> = {};

    if (username) {
      if (username.trim().length < 3) {
        return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
      }
      // Check uniqueness
      await dbConnect();
      const existing = await User.findOne({ username: username.trim(), email: { $ne: session.user.email } });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      updateData.username = username.trim();
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    await dbConnect();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      user: {
        username: updatedUser.username,
        image: updatedUser.image,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
