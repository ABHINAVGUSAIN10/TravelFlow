import { NextRequest, NextResponse } from "next/server";
import { findNearbyAirports } from "@/lib/airports";
import { geocodePlace, GeoPoint } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export interface JourneyLeg {
  mode: "flight" | "train" | "taxi" | "bus" | "transit";
  origin: string;
  destination: string;
  duration: string;
  durationMins: number;
  price: string;
  distanceKm: number;
  path: [number, number][];
  departureTime?: string;
  arrivalTime?: string;
  elevationProfile?: number[];
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function formatDuration(mins: number) {
  const h = Math.floor(mins/60), m = Math.floor(mins%60);
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function generateSchedule(startDate: Date, durationMins: number) {
  const dep = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endDate = new Date(startDate.getTime() + durationMins * 60000);
  const arr = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { dep, arr, nextDate: endDate };
}

function isMountainous(locationName: string): boolean {
  const mountains = ['leh', 'manali', 'nainital', 'shimla', 'srinagar', 'mussoorie', 'darjeeling', 'gangtok', 'dehradun', 'mandi', 'kullu'];
  const loc = locationName.toLowerCase();
  return mountains.some(m => loc.includes(m));
}

// Race a promise against a deadline — returns `fallback` if deadline fires first
function withDeadline<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(fallback), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }).catch(() => { clearTimeout(t); resolve(fallback); });
  });
}

// ── Overpass API helpers (free OSM data, no API key) ──────────────────────────
interface Place { name: string; lat: number; lng: number; }

async function overpassNearest(query: string): Promise<Place | null> {
  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "TravelFlow/1.0 (college project)" }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.elements?.length) return null;

    let best: Place | null = null, minD = Infinity;
    for (const el of data.elements) {
      const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) continue;
      // Use the lat/lng embedded in the query string to compute distance
      // (we'll sort by order returned since Overpass returns closest-ish first)
      if (!best || minD > 0) { best = { name: el.tags?.name ?? "Unknown", lat, lng }; minD = 0; break; }
    }
    return best;
  } catch { return null; }
}

// (findAirport removed in favor of static heuristic dataset in @/lib/airports)

// Find closest railway station within radiusKm (50 km covers most Indian city centres).
async function findStation(lat: number, lng: number, radiusKm = 50): Promise<Place | null> {
  // Photon Reverse API provides lightning-fast POI lookups
  try {
    const res = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&radius=${radiusKm}&osm_tag=railway:station&limit=5`,
      { headers: { "User-Agent": "TravelFlow/1.0" }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features?.length) return null;

    let best: Place | null = null, minD = Infinity;
    for (const f of data.features) {
      const elLat = f.geometry.coordinates[1];
      const elLng = f.geometry.coordinates[0];
      const d = getDistance(lat, lng, elLat, elLng);
      if (d < minD) { minD = d; best = { name: f.properties.name || "Railway Station", lat: elLat, lng: elLng }; }
    }
    return best;
  } catch (err) {
    console.log(`[Photon] Error finding train stn:`, err);
    return null;
  }
}

// Find closest bus station within radiusKm
async function findBusStation(lat: number, lng: number, radiusKm = 15): Promise<Place | null> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&radius=${radiusKm}&osm_tag=amenity:bus_station&limit=5`,
      { headers: { "User-Agent": "TravelFlow/1.0" }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features?.length) return null;

    let best: Place | null = null, minD = Infinity;
    for (const f of data.features) {
      const elLat = f.geometry.coordinates[1];
      const elLng = f.geometry.coordinates[0];
      const d = getDistance(lat, lng, elLat, elLng);
      if (d < minD) { minD = d; best = { name: f.properties.name || "Bus Station", lat: elLat, lng: elLng }; }
    }
    return best;
  } catch (err) {
    console.log(`[Photon] Error finding bus stn:`, err);
    return null;
  }
}

// ── OSRM road path (free, no key) ─────────────────────────────────────────────
async function roadPath(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<{ path: [number,number][]; km: number; mins: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { headers: { "User-Agent": "TravelFlow/1.0" }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const rt = data.routes[0];
    return {
      path: rt.geometry.coordinates.map(([lg, la]: [number,number]) => [la, lg] as [number,number]),
      km: rt.distance / 1000,
      mins: rt.duration / 60,
    };
  } catch { return null; }
}

// ── Great-circle arc for flights ──────────────────────────────────────────────
function flightArc(lat1: number, lon1: number, lat2: number, lon2: number, n=80): [number,number][] {
  const rad = (d: number) => d*Math.PI/180, deg = (r: number) => r*180/Math.PI;
  const φ1=rad(lat1), λ1=rad(lon1), φ2=rad(lat2), λ2=rad(lon2);
  const d = 2*Math.asin(Math.sqrt(Math.sin((φ2-φ1)/2)**2+Math.cos(φ1)*Math.cos(φ2)*Math.sin((λ2-λ1)/2)**2));
  if (d < 0.0001) return [[lat1,lon1],[lat2,lon2]];
  return Array.from({length:n+1}, (_,i) => {
    const t=i/n, A=Math.sin((1-t)*d)/Math.sin(d), B=Math.sin(t*d)/Math.sin(d);
    const x=A*Math.cos(φ1)*Math.cos(λ1)+B*Math.cos(φ2)*Math.cos(λ2);
    const y=A*Math.cos(φ1)*Math.sin(λ1)+B*Math.cos(φ2)*Math.sin(λ2);
    const z=A*Math.sin(φ1)+B*Math.sin(φ2);
    return [deg(Math.atan2(z,Math.sqrt(x*x+y*y))), deg(Math.atan2(y,x))] as [number,number];
  });
}

// ── Straight-line list (fallback) ─────────────────────────────────────────────
function straightLine(p1: GeoPoint, p2: GeoPoint): [number,number][] {
  return [[p1.lat,p1.lng],[p2.lat,p2.lng]];
}

async function fetchElevationProfile(path: [number,number][]): Promise<number[] | undefined> {
  if (!path || path.length < 2) return undefined;
  try {
    const step = Math.max(1, Math.floor(path.length / 10));
    const samples = [];
    for (let i = 0; i < path.length; i += step) {
      if (samples.length < 10) samples.push(path[i]);
    }
    if (samples.length > 0 && samples[samples.length - 1] !== path[path.length - 1]) {
      samples[samples.length - 1] = path[path.length - 1]; // ensure destination is included
    }
    const locStr = samples.map(p => `${p[0]},${p[1]}`).join('|');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await fetch(`https://api.opentopodata.org/v1/srtm90m?locations=${locStr}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return undefined;
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.results.map((r: any) => Math.round(r.elevation || 0));
  } catch {
    return undefined;
  }
}

// ── Route builders ─────────────────────────────────────────────────────────────
async function buildRoad(src: GeoPoint, dst: GeoPoint, srcL: string, dstL: string, crowKm: number): Promise<JourneyLeg[]> {
  const osrm = await withDeadline(roadPath(src.lat,src.lng,dst.lat,dst.lng), 6000, null);
  const path = osrm?.path ?? straightLine(src,dst);
  const km   = osrm ? Math.round(osrm.km)    : Math.round(crowKm*1.3);
  let mins = osrm ? osrm.mins              : (crowKm/50)*60;
  
  const isMtn = isMountainous(srcL) || isMountainous(dstL);
  if (isMtn) {
    mins *= 1.8; // Mountain roads are significantly slower
  }
  
  const elevationProfile = await fetchElevationProfile(path);
  const d = new Date(); d.setHours(8, 0, 0, 0);
  const sched = generateSchedule(d, mins); // Start at 8 AM

  return [{
    mode: "taxi", origin: srcL, destination: dstL,
    duration: formatDuration(mins), durationMins: Math.round(mins),
    price: `₹${Math.round(km * (isMtn ? 18 : 12))}`, distanceKm: km, path,
    departureTime: sched.dep, arrivalTime: sched.arr, elevationProfile
  }];
}

async function buildFlight(
  src: GeoPoint, dst: GeoPoint,
  srcApt: Place, dstApt: Place,
  srcL: string, dstL: string
): Promise<JourneyLeg[]> {
  const [t1, t3] = await Promise.all([
    withDeadline(roadPath(src.lat,src.lng,srcApt.lat,srcApt.lng), 6000, null),
    withDeadline(roadPath(dstApt.lat,dstApt.lng,dst.lat,dst.lng), 6000, null),
  ]);
  const k1 = t1 ? Math.round(t1.km) : Math.round(getDistance(src.lat,src.lng,srcApt.lat,srcApt.lng));
  const m1 = t1 ? t1.mins : (k1/35)*60;
  const k3 = t3 ? Math.round(t3.km) : Math.round(getDistance(dstApt.lat,dstApt.lng,dst.lat,dst.lng));
  const m3 = t3 ? t3.mins : (k3/35)*60;
  const fkm = Math.round(getDistance(srcApt.lat,srcApt.lng,dstApt.lat,dstApt.lng));
  const fmin = (fkm/700)*60+90;
  
  const d = new Date(); d.setHours(10, 0, 0, 0);
  const s1 = generateSchedule(d, m1);
  const s2 = generateSchedule(s1.nextDate, fmin);
  const s3 = generateSchedule(s2.nextDate, m3);

  return [
    { mode:"taxi", origin:srcL,       destination:srcApt.name, duration:formatDuration(m1), durationMins:m1, price:`₹${Math.round(k1*20)}`,             distanceKm:k1,  path:t1?.path??[[src.lat,src.lng],[srcApt.lat,srcApt.lng]], departureTime: s1.dep, arrivalTime: s1.arr },
    { mode:"flight",origin:srcApt.name,destination:dstApt.name,duration:formatDuration(fmin),durationMins:fmin,price:`₹${Math.round(fkm*4+2500)}`,        distanceKm:fkm, path:flightArc(srcApt.lat,srcApt.lng,dstApt.lat,dstApt.lng,80), departureTime: s2.dep, arrivalTime: s2.arr },
    { mode:"taxi", origin:dstApt.name, destination:dstL,       duration:formatDuration(m3), durationMins:m3, price:`₹${Math.round(k3*20)}`,             distanceKm:k3,  path:t3?.path??[[dstApt.lat,dstApt.lng],[dst.lat,dst.lng]], departureTime: s3.dep, arrivalTime: s3.arr },
  ];
}

async function buildTrain(
  src: GeoPoint, dst: GeoPoint,
  srcStn: Place, dstStn: Place,
  srcL: string, dstL: string
): Promise<JourneyLeg[]> {
  const [t1, t2, t3] = await Promise.all([
    withDeadline(roadPath(src.lat,src.lng,srcStn.lat,srcStn.lng), 6000, null),
    withDeadline(roadPath(srcStn.lat,srcStn.lng,dstStn.lat,dstStn.lng), 6000, null),
    withDeadline(roadPath(dstStn.lat,dstStn.lng,dst.lat,dst.lng), 6000, null),
  ]);
  const k1 = t1 ? Math.round(t1.km) : Math.round(getDistance(src.lat,src.lng,srcStn.lat,srcStn.lng));
  const m1 = t1 ? t1.mins : (k1/30)*60;
  const k2 = t2 ? Math.round(t2.km) : Math.round(getDistance(srcStn.lat,srcStn.lng,dstStn.lat,dstStn.lng)*1.15);
  const m2 = (k2/70)*60; // 70 km/h Indian train average
  const k3 = t3 ? Math.round(t3.km) : Math.round(getDistance(dstStn.lat,dstStn.lng,dst.lat,dst.lng));
  const m3 = t3 ? t3.mins : (k3/30)*60;
  
  const d = new Date(); d.setHours(20, 30, 0, 0); // Evening train
  const s1 = generateSchedule(d, m1);
  const s2 = generateSchedule(s1.nextDate, m2);
  const s3 = generateSchedule(s2.nextDate, m3);

  return [
    { mode:"taxi",  origin:srcL,       destination:srcStn.name, duration:formatDuration(m1), durationMins:m1, price:`₹${Math.round(k1*18)}`, distanceKm:k1, path:t1?.path??[[src.lat,src.lng],[srcStn.lat,srcStn.lng]], departureTime: s1.dep, arrivalTime: s1.arr },
    { mode:"train", origin:srcStn.name,destination:dstStn.name, duration:formatDuration(m2), durationMins:m2, price:`₹${Math.round(k2*2.5+100)}`, distanceKm:k2, path:t2?.path??[[srcStn.lat,srcStn.lng],[dstStn.lat,dstStn.lng]], departureTime: s2.dep, arrivalTime: s2.arr },
    { mode:"taxi",  origin:dstStn.name,destination:dstL,        duration:formatDuration(m3), durationMins:m3, price:`₹${Math.round(k3*18)}`, distanceKm:k3, path:t3?.path??[[dstStn.lat,dstStn.lng],[dst.lat,dst.lng]], departureTime: s3.dep, arrivalTime: s3.arr },
  ];
}

async function buildBus(
  src: GeoPoint, dst: GeoPoint,
  srcStn: Place, dstStn: Place,
  srcL: string, dstL: string
): Promise<JourneyLeg[]> {
  const [t1, t2, t3] = await Promise.all([
    withDeadline(roadPath(src.lat,src.lng,srcStn.lat,srcStn.lng), 6000, null),
    withDeadline(roadPath(srcStn.lat,srcStn.lng,dstStn.lat,dstStn.lng), 6000, null),
    withDeadline(roadPath(dstStn.lat,dstStn.lng,dst.lat,dst.lng), 6000, null),
  ]);
  const k1 = t1 ? Math.round(t1.km) : Math.round(getDistance(src.lat,src.lng,srcStn.lat,srcStn.lng));
  const m1 = t1 ? t1.mins : (k1/30)*60;
  const k2 = t2 ? Math.round(t2.km) : Math.round(getDistance(srcStn.lat,srcStn.lng,dstStn.lat,dstStn.lng)*1.2);
  let m2 = t2 ? t2.mins : (k2/50)*60;
  const k3 = t3 ? Math.round(t3.km) : Math.round(getDistance(dstStn.lat,dstStn.lng,dst.lat,dst.lng));
  const m3 = t3 ? t3.mins : (k3/30)*60;

  const isMtn = isMountainous(srcL) || isMountainous(dstL);
  if (isMtn) m2 *= 1.6; // Mountains slow down buses significantly

  const d = new Date(); d.setHours(22, 0, 0, 0); // Overnight bus
  const s1 = generateSchedule(d, m1);
  const s2 = generateSchedule(s1.nextDate, m2);
  const s3 = generateSchedule(s2.nextDate, m3);

  return [
    { mode:"taxi", origin:srcL,       destination:srcStn.name, duration:formatDuration(m1), durationMins:m1, price:`₹${Math.round(k1*15)}`, distanceKm:k1, path:t1?.path??[[src.lat,src.lng],[srcStn.lat,srcStn.lng]], departureTime: s1.dep, arrivalTime: s1.arr },
    { mode:"bus",  origin:srcStn.name,destination:dstStn.name, duration:formatDuration(m2), durationMins:m2, price:`₹${Math.round(k2*(isMtn?4:2.5))}`, distanceKm:k2, path:t2?.path??[[srcStn.lat,srcStn.lng],[dstStn.lat,dstStn.lng]], departureTime: s2.dep, arrivalTime: s2.arr },
    { mode:"taxi", origin:dstStn.name,destination:dstL,        duration:formatDuration(m3), durationMins:m3, price:`₹${Math.round(k3*15)}`, distanceKm:k3, path:t3?.path??[[dstStn.lat,dstStn.lng],[dst.lat,dst.lng]], departureTime: s3.dep, arrivalTime: s3.arr },
  ];
}

// ── Master engine ─────────────────────────────────────────────────────────────
//
// Decision tree (never throws — always returns at least a straight-line road leg):
//
//   < 200 km              → Road taxi via OSRM
//   200–500 km            → Rail (if stations within 50km) → Bus via OSRM
//   ≥ 500 km              → Airports (within 250km) → Rail → Bus
//
// All infrastructure data: Overpass OSM API — free, no key needed.
// Airport radius 250 km covers Leh (110km from Pangong Tso), Cochin (110km from Munnar), etc.
async function getSmartRoutes(sourceQuery: string, destQuery: string): Promise<JourneyLeg[][]> {
  const [srcGeo, dstGeo] = await Promise.all([
    geocodePlace(sourceQuery),
    geocodePlace(destQuery),
  ]);

  if (!srcGeo || !dstGeo) {
    console.warn(`[routes] Geocoding failed — src:${!!srcGeo} dst:${!!dstGeo}`);
    return [[{
      mode: "bus",
      origin: sourceQuery,
      destination: destQuery,
      duration: "Unknown",
      durationMins: 0,
      price: "N/A",
      distanceKm: 0,
      path: srcGeo && dstGeo ? [[srcGeo.lat, srcGeo.lng],[dstGeo.lat,dstGeo.lng]] : [[20.5937,78.9629],[20.5937,78.9629]],
    }]];
  }

  const crowKm = getDistance(srcGeo.lat, srcGeo.lng, dstGeo.lat, dstGeo.lng);
  console.log(`[routes] ${sourceQuery} → ${destQuery}: ${Math.round(crowKm)} km crow`);
  const routes: JourneyLeg[][] = [];

  // Very short distance (intra-city): Return single road route
  if (crowKm < 40) {
    routes.push(await buildRoad(srcGeo, dstGeo, sourceQuery, destQuery, crowKm));
    return routes;
  }

  // Lookups based on distance
  const isLong = crowKm >= 250;
  
  const [srcStn, dstStn, srcBus, dstBus] = await withDeadline(
    Promise.all([
      findStation(srcGeo.lat, srcGeo.lng, 50),
      findStation(dstGeo.lat, dstGeo.lng, 50),
      findBusStation(srcGeo.lat, srcGeo.lng, 30),
      findBusStation(dstGeo.lat, dstGeo.lng, 30),
    ]),
    8000,
    [null, null, null, null] as [Place|null, Place|null, Place|null, Place|null]
  );

  // 1. Primary: Flight (if long enough) - Heuristic Module
  if (isLong) {
    const srcApts = findNearbyAirports(srcGeo.lat, srcGeo.lng, 250);
    const dstApts = findNearbyAirports(dstGeo.lat, dstGeo.lng, 250);
    
    if (srcApts.length > 0 && dstApts.length > 0) {
      // Don't fly if it's the exact same airport
      if (srcApts[0].code !== dstApts[0].code) {
         routes.push(await buildFlight(
           srcGeo, dstGeo,
           { name: srcApts[0].name, lat: srcApts[0].lat, lng: srcApts[0].lng },
           { name: dstApts[0].name, lat: dstApts[0].lat, lng: dstApts[0].lng },
           sourceQuery, destQuery
         ));
      }
    }
  }

  // 2. Train route
  if (srcStn && dstStn) {
    routes.push(await buildTrain(srcGeo, dstGeo, srcStn, dstStn, sourceQuery, destQuery));
  }

  // 3. Structured Bus route
  if (srcBus && dstBus) {
    routes.push(await buildBus(srcGeo, dstGeo, srcBus, dstBus, sourceQuery, destQuery));
  }

  // Fallback direct road route if nothing else worked
  if (routes.length === 0) {
    routes.push(await buildRoad(srcGeo, dstGeo, sourceQuery, destQuery, crowKm));
  } else if (!isLong && routes.length === 1) { // If only train/bus was found on medium dist, add a pure road option
    routes.push(await buildRoad(srcGeo, dstGeo, sourceQuery, destQuery, crowKm));
  }

  return routes;
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const dest   = searchParams.get("dest");
  if (!source || !dest)
    return NextResponse.json({ error: "Missing source or dest params" }, { status: 400 });

  try {
    // Master deadline: guarantee the API always responds within 20s
    const routes = await withDeadline(
      getSmartRoutes(source, dest),
      20000,
      [] as JourneyLeg[][]
    );

    if (routes.length === 0) {
      // Even the deadline expired — return a placeholder so the UI doesn't crash
      return NextResponse.json({ routes: [[{
        mode: "bus" as const, origin: source, destination: dest,
        duration: "Unknown", durationMins: 0, price: "N/A", distanceKm: 0,
        path: [[20.5937, 78.9629], [20.5937, 78.9629]] as [number,number][],
      }]] });
    }

    return NextResponse.json({ routes });
  } catch (err) {
    console.error("[routes API] uncaught error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
