export interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const MAJOR_AIRPORTS: Airport[] = [
  { code: "DEL", name: "Indira Gandhi International Airport, New Delhi", lat: 28.5562, lng: 77.1000 },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport, Mumbai", lat: 19.0896, lng: 72.8656 },
  { code: "BLR", name: "Kempegowda International Airport, Bengaluru", lat: 13.1989, lng: 77.7068 },
  { code: "MAA", name: "Chennai International Airport, Chennai", lat: 12.9941, lng: 80.1709 },
  { code: "CCU", name: "Netaji Subhash Chandra Bose International Airport, Kolkata", lat: 22.6520, lng: 88.4463 },
  { code: "HYD", name: "Rajiv Gandhi International Airport, Hyderabad", lat: 17.2403, lng: 78.4294 },
  { code: "GOI", name: "Dabolim Airport, Goa", lat: 15.3808, lng: 73.8313 },
  { code: "GOX", name: "Manohar International Airport, Mopa, Goa", lat: 15.7317, lng: 73.8617 },
  { code: "IXL", name: "Kushok Bakula Rimpochee Airport, Leh", lat: 34.1359, lng: 77.5465 },
  { code: "SXR", name: "Sheikh ul-Alam International Airport, Srinagar", lat: 33.9870, lng: 74.7743 },
  { code: "DED", name: "Jolly Grant Airport, Dehradun", lat: 30.1897, lng: 78.1800 },
  { code: "IXB", name: "Bagdogra International Airport, Siliguri", lat: 26.6811, lng: 88.3286 },
  { code: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport, Guwahati", lat: 26.1061, lng: 91.5859 },
  { code: "COK", name: "Cochin International Airport, Kochi", lat: 10.1518, lng: 76.3930 },
  { code: "TRV", name: "Trivandrum International Airport, Thiruvananthapuram", lat: 8.4821, lng: 76.9201 },
  { code: "IXZ", name: "Veer Savarkar International Airport, Port Blair", lat: 11.6410, lng: 92.7300 },
  { code: "IXC", name: "Shaheed Bhagat Singh International Airport, Chandigarh", lat: 30.6735, lng: 76.7885 },
  { code: "ATQ", name: "Sri Guru Ram Dass Jee International Airport, Amritsar", lat: 31.7096, lng: 74.7973 },
  { code: "JAI", name: "Jaipur International Airport, Jaipur", lat: 26.8242, lng: 75.8122 },
  { code: "VNS", name: "Lal Bahadur Shastri International Airport, Varanasi", lat: 25.4520, lng: 82.8591 },
  { code: "PNQ", name: "Pune Airport, Pune", lat: 18.5822, lng: 73.9197 },
];

// Helper: Haversine distance in km
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearbyAirports(lat: number, lng: number, maxRadiusKm = 250): (Airport & { distanceKm: number })[] {
  const airports = MAJOR_AIRPORTS.map(apt => ({
    ...apt,
    distanceKm: getDistance(lat, lng, apt.lat, apt.lng)
  }));
  
  // Filter by radius and sort by closest
  return airports
    .filter(apt => apt.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
