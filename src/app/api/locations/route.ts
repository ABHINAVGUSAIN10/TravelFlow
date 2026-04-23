import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";
import { locations as FALLBACK_LOCATIONS } from "../../../../scripts/locationData";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (category && category !== "All") {
      if (category.includes(",")) {
        filter.category = { $in: category.split(",").map((c) => c.trim()) };
      } else {
        filter.category = category;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const locations = await Location.find(filter).limit(limit).sort({ title: 1 });

    return NextResponse.json({ locations, total: locations.length });
  } catch (error) {
    console.warn("MongoDB connection failed or query error. Falling back to seed data.");

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || "").toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "50");

    let fallbackLocations = [...FALLBACK_LOCATIONS];

    if (category && category !== "All") {
      const cats = category.split(",").map(c => c.trim());
      fallbackLocations = fallbackLocations.filter(l => cats.includes(l.category));
    }

    if (search) {
      fallbackLocations = fallbackLocations.filter((l: any) => 
        l.title.toLowerCase().includes(search) || 
        l.subtitle.toLowerCase().includes(search) || 
        l.state.toLowerCase().includes(search) || 
        l.description.toLowerCase().includes(search)
      );
    }

    const locations = fallbackLocations.slice(0, limit).map((l: any) => ({
      ...l,
      _id: String(l.title) // Mock the MongoDB _id field format
    }));

    return NextResponse.json({ locations, total: locations.length });
  }
}
