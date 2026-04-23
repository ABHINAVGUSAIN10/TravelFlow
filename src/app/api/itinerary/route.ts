import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Itinerary from "@/models/Itinerary";
import User from "@/models/User";

// POST — Create a new itinerary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { source, destination, startDate, endDate, travelers, totalCost, routeLegs, hotel, guide } = body;

    if (!source || !destination || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const itinerary = await Itinerary.create({
      userId: user._id,
      source,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      travelers: travelers || 1,
      totalCost: totalCost || 0,
      routeLegs: routeLegs || [],
      hotel: hotel || null,
      guide: guide || null,
      status: new Date(startDate) > new Date() ? "upcoming" : "completed",
    });

    return NextResponse.json({ itinerary, message: "Trip booked successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 });
  }
}

// GET — Fetch all itineraries for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ itineraries: [] });
    }

    const itineraries = await Itinerary.find({ userId: user._id, status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .lean();

    // Auto-update status for past trips
    const now = new Date();
    for (const it of itineraries) {
      if (it.status === "upcoming" && new Date(it.endDate) < now) {
        await Itinerary.updateOne({ _id: it._id }, { status: "completed" });
        it.status = "completed";
      }
    }

    return NextResponse.json({ itineraries });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json({ error: "Failed to fetch itineraries" }, { status: 500 });
  }
}

// PATCH — Cancel an itinerary
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing itinerary ID" }, { status: 400 });
    }

    const itinerary = await Itinerary.findOne({ _id: id, userId: user._id });
    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    const now = new Date();
    const createdAt = new Date(itinerary.createdAt);
    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) {
      return NextResponse.json({ error: "Cannot cancel trip after 2 days of booking" }, { status: 400 });
    }

    itinerary.status = "cancelled";
    await itinerary.save();

    return NextResponse.json({ message: "Trip cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling itinerary:", error);
    return NextResponse.json({ error: "Failed to cancel itinerary" }, { status: 500 });
  }
}
