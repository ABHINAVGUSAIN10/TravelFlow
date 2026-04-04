import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Delete the user document
    await User.findOneAndDelete({ email: session.user.email });

    // Also delete any NextAuth adapter documents (accounts, sessions)
    // We do this manually to keep things clean
    const client = (await import("@/lib/mongodb-client")).default;
    const db = (await client).db();
    await db.collection("accounts").deleteMany({ userId: session.user.email });
    await db.collection("sessions").deleteMany({ userEmail: session.user.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
