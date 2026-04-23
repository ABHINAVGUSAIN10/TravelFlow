import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";
import mongoose from "mongoose";
import { locations as FALLBACK_LOCATIONS } from "../../../../../scripts/locationData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await dbConnect();

    // If id looks like a valid MongoDB ObjectId, search by _id; otherwise search by title
    const isObjectId = mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
    const location = isObjectId
      ? await Location.findById(id)
      : await Location.findOne({ title: { $regex: `^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" } });

    if (!location) {
      // Try fallback data before returning 404
      const fallback = FALLBACK_LOCATIONS.find(
        (l) => l.title.toLowerCase() === decodeURIComponent(id).toLowerCase()
      );
      if (fallback) {
        return NextResponse.json({ location: { ...fallback, _id: fallback.title } });
      }
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.warn("MongoDB error in /api/locations/[id]. Falling back to seed data.");

    // Fallback to seed data
    const fallback = FALLBACK_LOCATIONS.find(
      (l) => l.title.toLowerCase() === decodeURIComponent(id).toLowerCase()
    );
    if (fallback) {
      return NextResponse.json({ location: { ...fallback, _id: fallback.title } });
    }

    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }
}
