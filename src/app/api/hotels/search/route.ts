import { NextRequest, NextResponse } from "next/server";
const { getJson } = require("serpapi");

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dest = searchParams.get("dest");
  const checkin = searchParams.get("checkin") || "2026-10-12";
  const checkout = searchParams.get("checkout") || "2026-10-18";
  const nextPageToken = searchParams.get("next_page_token");

  if (!dest) {
    return NextResponse.json({ error: "Missing dest parameter" }, { status: 400 });
  }

  try {
    const searchRes = await getJson({
      engine: "google_hotels",
      q: dest,
      check_in_date: checkin,
      check_out_date: checkout,
      adults: 2,
      currency: "INR",
      gl: "in",
      hl: "en",
      api_key: SERPAPI_KEY,
      ...(nextPageToken ? { next_page_token: nextPageToken } : {})
    });

    let hotels = [] as any[];
    if (searchRes?.properties?.length > 0) {
      hotels = searchRes.properties.map((p: any) => {
        const image = p.images?.[0]?.original_image || p.images?.[0]?.thumbnail || "";
        
        return {
          id: p.property_token || p.name,
          name: p.name,
          image: image,
          rating: p.overall_rating ?? 0,
          totalReviews: p.reviews ?? 0,
          reviewSummary: p.hotel_class || "Great",
          price: p.rate_per_night?.lowest ?? "",
          priceRaw: p.rate_per_night?.extracted_lowest ?? 0,
          strikethrough: "",
          address: p.nearby_places?.[0]?.name ? `Near ${p.nearby_places[0].name}` : dest,
          starRating: p.extracted_hotel_class ?? 0,
          badge: p.amenities?.[0] || "",
        };
      }).sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    // Fallback if API returns empty
    if (hotels.length === 0 && !nextPageToken) {
      hotels = [
        {
          id: "mock-1",
          name: `The Grand Summit ${dest}`,
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          rating: 9.4,
          totalReviews: 245,
          reviewSummary: "Exceptional",
          price: "₹8,450",
          priceRaw: 8450,
          strikethrough: "₹12,000",
          address: `${dest} Central`,
          starRating: 5,
          badge: "Top Rated",
        },
        {
          id: "mock-2",
          name: `Heritage Resort ${dest}`,
          image: "https://images.unsplash.com/photo-1542314831-c6a4d14b837c?auto=format&fit=crop&w=800&q=80",
          rating: 8.8,
          totalReviews: 120,
          reviewSummary: "Excellent",
          price: "₹5,200",
          priceRaw: 5200,
          strikethrough: "₹7,500",
          address: `Near ${dest} Valley`,
          starRating: 4,
          badge: "Great Value",
        },
        {
          id: "mock-3",
          name: `Alpine Retreat ${dest}`,
          image: "https://images.unsplash.com/photo-1551882547-ff40c0d1398c?auto=format&fit=crop&w=800&q=80",
          rating: 8.2,
          totalReviews: 85,
          reviewSummary: "Very Good",
          price: "₹3,800",
          priceRaw: 3800,
          strikethrough: "",
          address: `Downtown ${dest}`,
          starRating: 3,
          badge: "",
        },
        {
          id: "mock-4",
          name: `${dest} Backpackers Hostel`,
          image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
          rating: 7.5,
          totalReviews: 412,
          reviewSummary: "Good",
          price: "₹1,200",
          priceRaw: 1200,
          strikethrough: "₹1,800",
          address: `${dest} Market`,
          starRating: 2,
          badge: "Popular",
        }
      ];
    }

    return NextResponse.json({ 
      hotels, 
      regionId: `serpapi-${dest}`,
      nextPageToken: searchRes?.serpapi_pagination?.next_page_token || null
    });
  } catch (err: any) {
    console.error("Hotel search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
