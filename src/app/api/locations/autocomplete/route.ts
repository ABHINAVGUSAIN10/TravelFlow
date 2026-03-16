import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await Location.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { subtitle: { $regex: q, $options: "i" } },
        { state: { $regex: q, $options: "i" } },
      ],
    })
      .select("title subtitle state category cardImage accentColor")
      .limit(6)
      .sort({ title: 1 })
      .lean();

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
