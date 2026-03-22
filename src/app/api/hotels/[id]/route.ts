import { NextRequest, NextResponse } from "next/server";
const { getJson } = require("serpapi");

const SERPAPI_KEY = "92186c701692fc1bf9ec9520b96e509e0aa08bd9ae5712c523908abdbf5f3c97";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const checkin = searchParams.get("checkin") || "2026-10-12";
  const checkout = searchParams.get("checkout") || "2026-10-18";
  const hotelName = searchParams.get("name") || id;

  try {
    if (id.startsWith("mock-")) {
      const mockHotel = {
        id,
        name: `The Grand Summit`,
        tagline: "Experience luxury and comfort in the heart of the city.",
        starRating: 5,
        reviewScore: 9.4,
        totalReviews: 245,
        reviewQuality: "Exceptional",
        address: "Central Avenue, Downtown",
        fullAddress: "123 Central Avenue, Downtown, City, Country",
        coordinates: { lat: 32.25, lng: 77.17 },
        images: [
          "https://images.unsplash.com/photo-1542314831-c6a4d14b837c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"
        ],
        highlights: [
          { icon: "restaurant", title: "Buffet breakfast", subtitle: "Available daily" },
          { icon: "pool", title: "Outdoor pool", subtitle: "Open 8 AM - 10 PM" },
          { icon: "pets", title: "Pet friendly", subtitle: "Dogs only" },
        ],
        description: "A luxury stay offering stunning views, exceptional service, and close proximity to major attractions. Enjoy our world-class dining, spa services, and comfortable rooms equipped with modern amenities.",
        keyAmenities: [
          { icon: "wifi", text: "Free WiFi" },
          { icon: "directions_car", text: "Free parking" },
          { icon: "ac_unit", text: "Air conditioning" },
          { icon: "spa", text: "Full-service spa" },
          { icon: "fitness_center", text: "Gym" },
          { icon: "local_bar", text: "Bar/Lounge" }
        ],
        amenityGroups: [
          {
            title: "Internet",
            items: [
              { name: "Available in all rooms: Free WiFi", icon: "wifi", items: ["In-room WiFi speed: 250+ Mbps"] },
              { name: "Available in some public areas: Free WiFi", icon: "wifi", items: [] }
            ]
          },
          {
            title: "Parking",
            items: [
              { name: "Free secured self parking on site", icon: "directions_car", items: ["Wheelchair-accessible parking available"] }
            ]
          }
        ],
        nearbyPlaces: [
          { name: "Mall Road", distance: "6 min drive" },
          { name: "Tibetan Monastery", distance: "8 min drive" },
          { name: "Solang Valley", distance: "20 min drive" }
        ],
        areaInfo: {
          description: "Located centrally with easy access to shopping and major attractions. A perfect blend of urban convenience and natural beauty.",
          whatsNearby: ["Main Square - 10 min walk", "Transport Hub - 5 min drive", "Hiking Trail Entry - 12 min drive", "City Museum - 8 min drive"],
          gettingAround: ["Metro station - 2 min walk", "Airport - 45 min drive", "Bus stop - 1 min walk", "Taxi stand - 3 min walk"],
          restaurants: ["The Local Eatery - 3 min walk", "Fine Dining - Onsite", "Himalayan Cafe - 5 min walk", "Spice Garden - 8 min walk"]
        },
        rooms: [] // Will use component fallback
      };
      return NextResponse.json(mockHotel);
    }

    // Call SerpAPI for hotel details
    const detailData = await getJson({
      engine: "google_hotels",
      q: hotelName,
      check_in_date: checkin,
      check_out_date: checkout,
      adults: 2,
      currency: "INR",
      gl: "in",
      hl: "en",
      api_key: SERPAPI_KEY,
      ...(id !== hotelName && !id.startsWith("room-") ? { property_token: id } : {})
    });

    const property = detailData?.properties?.[0] || detailData?.property || detailData;

    if (!property || !property.name) {
      return NextResponse.json({ error: "Failed to fetch hotel details" }, { status: 404 });
    }

    const images = (property.images || []).map((img: any) => img.original_image || img.thumbnail).filter(Boolean);
    const amenitiesList = property.amenities || ["Air conditioning", "Free Wi-Fi", "Parking"];

    // Build the response
    const hotel = {
      id,
      name: property.name || hotelName,
      tagline: property.description || "",
      starRating: property.extracted_hotel_class || property.hotel_class ? parseInt(property.hotel_class) : 0,
      reviewScore: property.overall_rating || property.location_rating || 0,
      totalReviews: property.reviews || 0,
      reviewQuality: property.hotel_class || "Excellent",
      address: property.nearby_places?.[0]?.name ? `Near ${property.nearby_places[0].name}` : "",
      fullAddress: property.nearby_places?.map((p: any) => p.name).join(", ") || "",
      coordinates: {
        lat: property.gps_coordinates?.latitude || 0,
        lng: property.gps_coordinates?.longitude || 0,
      },
      images,
      highlights: amenitiesList.slice(0, 3).map((a: string) => ({
        icon: "check_circle",
        title: a,
        subtitle: "Available"
      })),
      description: property.description || "",
      keyAmenities: amenitiesList.map((a: string) => ({
        icon: "check",
        text: a,
      })),
      policies: {
        checkinTime: property.check_in_time || "14:00",
        checkoutTime: property.check_out_time || "12:00",
        refundable: property.prices?.[0]?.free_cancellation || false,
      },
      amenityGroups: [
        {
          title: "Amenities",
          items: [
            { name: "Top Amenities", icon: "stars", items: amenitiesList }
          ]
        }
      ],
      nearbyPlaces: (property.nearby_places || []).map((p: any) => ({
        name: p.name,
        distance: p.transportations?.[0]?.duration || ""
      })),
      areaInfo: {
        description: "",
        whatsNearby: (property.nearby_places || []).map((p: any) => p.name),
        gettingAround: [],
        restaurants: [],
      },
      rooms: (property.prices || []).map((price: any, idx: number) => ({
        id: `room-${idx}`,
        name: price.source || "Standard Room",
        image: price.logo || images[idx] || images[0] || "",
        imageCount: 1,
        features: ["Free Wi-Fi", "Air conditioning"],
        badge: price.free_cancellation ? "Free Cancellation" : "",
        price: price.rate_per_night?.lowest || "",
        strikethrough: "",
        totalPrice: `Totals ${price.rate_per_night?.lowest || ""}`,
        discount: ""
      })),
    };

    return NextResponse.json(hotel);
  } catch (err: any) {
    console.error("Hotel detail error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
