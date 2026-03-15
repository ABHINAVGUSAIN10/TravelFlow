import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const location = await Location.findById(id);

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}
