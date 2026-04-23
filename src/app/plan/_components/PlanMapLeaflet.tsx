"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, LayerGroup } from "react-leaflet";
import L from "leaflet";
import { geocodePlace, reverseGeocode, GeoPoint } from "@/lib/geocode";
import { JourneyLeg } from "@/app/api/routes/route";

// ── Fix Leaflet's default icon paths being broken by webpack ──────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom circular icons ─────────────────────────────────────────────────────
function makeCircleIcon(color: string, symbol: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:48px; height:48px; border-radius:50%;
        background:${color}; display:flex; align-items:center; justify-content:center;
        box-shadow:0 0 20px ${color}99, 0 2px 8px rgba(0,0,0,0.5);
        border:2px solid rgba(255,255,255,0.2);
      ">
        <span class="material-symbols-outlined" style="color:white;font-size:22px;line-height:1">${symbol}</span>
      </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
}

// ── Pulsing "You Are Here" current location icon ──────────────────────────────
function makeCurrentLocationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute; width:48px; height:48px; border-radius:50%;
          background:rgba(59,111,232,0.15); border:2px solid rgba(59,111,232,0.5);
          animation: tf-pulse 2s ease-out infinite;
        "></div>
        <div style="
          position:absolute; width:30px; height:30px; border-radius:50%;
          background:rgba(59,111,232,0.25); border:2px solid rgba(59,111,232,0.7);
          animation: tf-pulse 2s ease-out 0.4s infinite;
        "></div>
        <div style="
          position:relative; width:14px; height:14px; border-radius:50%;
          background:#3B6FE8; border:3px solid white;
          box-shadow:0 0 12px rgba(59,111,232,0.8); z-index:1;
        "></div>
      </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
}

const ICON_BUS   = makeCircleIcon("#3B6FE8", "directions_bus");
const ICON_HOTEL = makeCircleIcon("#D30C5C", "bed");
const ICON_TREK  = makeCircleIcon("#B4D104", "hiking");

// Source: blue departure dot
function makeSourceIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:44px;height:44px;border-radius:50%;
      background:#3B6FE8;display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 24px rgba(59,111,232,0.8),0 0 6px rgba(0,0,0,0.6);
      border:3px solid white;
    "><span class="material-symbols-outlined" style="color:white;font-size:20px;line-height:1">trip_origin</span></div>`,
    iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -26],
  });
}
// Destination: pink flag dot
function makeDestIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:44px;height:44px;border-radius:50%;
      background:#D30C5C;display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 24px rgba(211,12,92,0.8),0 0 6px rgba(0,0,0,0.6);
      border:3px solid white;
    "><span class="material-symbols-outlined" style="color:white;font-size:20px;line-height:1">flag</span></div>`,
    iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -26],
  });
}

// ── MapController: fly to destination when it changes ────────────────────────
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom, map]);
  return null;
}

// ── FlyToHandler: fly to GPS position ────────────────────────────────────────
function FlyToHandler({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 13, { duration: 2 }); }, [target, map]);
  return null;
}

// ── MapRefSetter: captures genuine Leaflet map instance into a ref ────────────
function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// ── FitBoundsHandler: auto-zoom map to show the full route ───────────────────
function FitBoundsHandler({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [80, 80], animate: true, duration: 1.5 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

function getWaypoints(center: [number, number], bookedHotel?: string, hiredGuide?: string | null) {
  const [lat, lng] = center;
  const waypoints = [];
  if (bookedHotel) {
    waypoints.push({ pos: [lat + 0.005, lng + 0.015] as [number, number], icon: ICON_HOTEL, label: bookedHotel,  type: "Stay" });
  }
  if (hiredGuide) {
    waypoints.push({ pos: [lat + 0.020, lng - 0.005] as [number, number], icon: ICON_TREK,  label: `${hiredGuide}'s Trek`,  type: "Activity" });
  }
  return waypoints;
}

const DARK_TILE   = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  source?: string;
  destination?: string;
  onLocate?: (cityName: string) => void;
  routesList?: JourneyLeg[][];
  activeRouteIdx?: number;
  loading?: boolean;
  bookedHotel?: string;
  hiredGuide?: string | null;
  setActiveRouteIdx?: (idx: number) => void;
}

const DEFAULT_CENTER: [number, number] = [32.2432, 77.1892]; // Manali
const DEFAULT_ZOOM = 11;

type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "error";

export default function PlanMapLeaflet({ source, destination, onLocate, routesList = [], activeRouteIdx = 0, loading = false, bookedHotel, hiredGuide, setActiveRouteIdx }: Props) {
  const [center, setCenter]       = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom]     = useState(DEFAULT_ZOOM);
  const [geoLabel, setGeoLabel]   = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [layerMode, setLayerMode] = useState<"dark" | "satellite">("dark");

  // Geocoded endpoint pins — shown even before routes load
  const [srcPoint, setSrcPoint]   = useState<[number,number] | null>(null);
  const [dstPoint, setDstPoint]   = useState<[number,number] | null>(null);

  // GPS state
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [flyToTarget, setFlyToTarget]         = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus]             = useState<GeoStatus>("idle");
  const [geoErrorMsg, setGeoErrorMsg]         = useState<string>("");
  // Manual city fallback (used when GPS is blocked)
  const [manualCity, setManualCity]           = useState("");
  const [manualLoading, setManualLoading]     = useState(false);

  // FIX: ref to the real Leaflet map instance for programmatic zoom
  const mapRef = useRef<L.Map | null>(null);

  // Geocode BOTH endpoints to show pins while routes are fetching
  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    setIsGeocoding(true);
    setGeoLabel("");
    setSrcPoint(null);
    setDstPoint(null);

    // Geocode destination → move map center
    geocodePlace(destination).then((result: GeoPoint | null) => {
      if (cancelled) return;
      if (result) {
        const dp: [number,number] = [result.lat, result.lng];
        setCenter(dp);
        setDstPoint(dp);
        setMapZoom(5); // zoom out to show both pins
        setGeoLabel(result.displayName.split(",")[0]);
      }
      setIsGeocoding(false);
    });

    // Geocode source → store srcPoint
    if (source) {
      geocodePlace(source).then((result: GeoPoint | null) => {
        if (cancelled || !result) return;
        setSrcPoint([result.lat, result.lng]);
      });
    }

    return () => { cancelled = true; };
  }, [source, destination]);


  // FIX: "Use My Location" handler
  // The old overlay div had no pointer-events control, so Leaflet was intercepting
  // the click before it reached our button. Now we set pointer-events:none on the
  // container div and pointer-events:auto on each individual button (see JSX below).
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      setGeoErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setGeoStatus("loading");
    setGeoErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coords: [number, number] = [lat, lng];
        setCurrentLocation(coords);
        setFlyToTarget(coords);
        setGeoStatus("success");
        const cityName = await reverseGeocode(lat, lng);
        if (cityName && onLocate) onLocate(cityName);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus("denied");
          setGeoErrorMsg("Location access denied. Please allow location in your browser settings.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoStatus("unavailable");
          setGeoErrorMsg("Your location could not be determined.");
        } else {
          setGeoStatus("error");
          setGeoErrorMsg("Location request timed out. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onLocate]);

  const waypoints = getWaypoints(center, bookedHotel, hiredGuide);

  const TILE_URL = layerMode === "dark"
    ? DARK_TILE
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const TILE_ATTR = layerMode === "dark"
    ? ATTRIBUTION
    : "Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

  return (
    <section className="hidden lg:block w-1/2 relative bg-[#121c2a] overflow-hidden">

      {/* Pulse animation + Leaflet popup dark theme */}
      <style>{`
        @keyframes tf-pulse {
          0%   { transform: scale(0.8); opacity: 0.9; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: #0a1422 !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          color: #fff !important;
        }
        @keyframes marching-ants {
          to { stroke-dashoffset: -24; }
        }
        .marching-ants {
          animation: marching-ants 1s linear infinite;
        }
        .alt-route-path {
          transition: stroke-opacity 0.2s, stroke-width 0.2s;
        }
        .alt-route-path:hover {
          stroke-opacity: 0.8 !important;
          stroke-width: 8 !important;
          cursor: pointer;
        }
        .leaflet-popup-tip { background: #0a1422 !important; }
        .leaflet-popup-close-button { color: rgba(255,255,255,0.5) !important; }
        .leaflet-control-attribution {
          background: rgba(5,14,28,0.7) !important;
          color: rgba(255,255,255,0.4) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.5) !important; }
      `}</style>

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MapController center={center} zoom={mapZoom} />
        <FlyToHandler target={flyToTarget} />

        {/* FIX: captures real map instance so zoom buttons can call map.zoomIn/Out() */}
        <MapRefSetter mapRef={mapRef} />

        {/* ── Pre-route placeholders ──────────────────────────────────────────
            Show source + destination pins and a dashed line immediately after
            geocoding, even before the /api/routes response arrives.
            These are replaced by the full coloured route once routes load. */}
        {routesList.length === 0 && srcPoint && dstPoint && (
          <LayerGroup>
            <FitBoundsHandler points={[srcPoint, dstPoint]} />
            {/* Dashed placeholder route line */}
            <Polyline
              positions={[srcPoint, dstPoint]}
              pathOptions={{ color: "#ffffff", weight: 2, opacity: 0.18, dashArray: "10, 16" }}
            />
            {/* Source pin */}
            <Marker position={srcPoint} icon={makeSourceIcon()}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", minWidth: 130 }}>
                  <p style={{ fontSize: 10, color: "#3B6FE8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🚩 Departure</p>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{source?.split(",")[0]}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Calculating route…</p>
                </div>
              </Popup>
            </Marker>
            {/* Destination pin */}
            <Marker position={dstPoint} icon={makeDestIcon()}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", minWidth: 130 }}>
                  <p style={{ fontSize: 10, color: "#D30C5C", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🏁 Destination</p>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{destination?.split(",")[0]}</p>
                </div>
              </Popup>
            </Marker>
          </LayerGroup>
        )}

        {/* ── Route rendering ─────────────────────────────────────────────────
            Layer order (bottom → top):
            1. Unselected routes (faded dashed lines)
            2. Selected route glow underlay
            3. Selected route coloured legs (connectors dashed, main paths solid)
            4. Source / Destination markers
        ─────────────────────────────────────────────────────────────────────── */}
        {routesList.length > 0 && (() => {
          const activeRoute = routesList[activeRouteIdx] || routesList[0];
          const allPoints: [number, number][] = activeRoute.flatMap(leg => leg.path);
          const sourcePos  = activeRoute[0].path[0];
          const lastLeg    = activeRoute[activeRoute.length - 1];
          const destPos    = lastLeg.path[lastLeg.path.length - 1];

          return (
            <LayerGroup>
              <FitBoundsHandler points={allPoints} />

              {/* Inactive routes */}
              {routesList.map((route, rIdx) => {
                if (rIdx === activeRouteIdx) return null;
                const path = route.flatMap(l => l.path);
                return (
                  <Polyline
                    key={`alt-${rIdx}`}
                    positions={path}
                    pathOptions={{ color: "#ffffff", weight: 4, opacity: 0.15, dashArray: "5, 10", className: "alt-route-path" }}
                    eventHandlers={{
                      click: () => setActiveRouteIdx && setActiveRouteIdx(rIdx),
                    }}
                  />
                );
              })}

              {/* Active Route Glow */}
              <Polyline
                positions={allPoints}
                pathOptions={{ color: "#ffffff", weight: 16, opacity: 0.07, lineCap: "round", lineJoin: "round" }}
              />
              <Polyline
                positions={allPoints}
                pathOptions={{ color: "#3B6FE8", weight: 8, opacity: 0.12, lineCap: "round", lineJoin: "round" }}
              />

              {/* Active Route Legs */}
              {activeRoute.map((leg, idx) => {
                let color = "#EAED41";
                if (leg.mode === "flight") color = "#DF33DF";
                if (leg.mode === "train")  color = "#0EBCDC";
                if (leg.mode === "bus")    color = "#3B6FE8";
                
                // Identify connector paths (local taxi transit to/from hub)
                const isConnector = leg.mode === "taxi" && (idx === 0 || idx === activeRoute.length - 1);
                const isFlight = leg.mode === "flight";

                let dashStr = undefined;
                let weight = 4;
                if (isConnector) { dashStr = "4, 8"; weight = 3; color="#ffffff"; }
                else if (isFlight) { dashStr = "10, 14"; weight = 3; }

                return (
                  <LayerGroup key={`leg-${idx}`}>
                    <Polyline
                      positions={leg.path}
                      pathOptions={{ color, weight: isConnector ? 8 : 10, opacity: isConnector ? 0.05 : 0.18, lineCap: "round", lineJoin: "round" }}
                    />
                    <Polyline
                      positions={leg.path}
                      pathOptions={{
                        color,
                        weight,
                        opacity: isConnector ? 0.7 : 0.95,
                        dashArray: dashStr || "10, 14",
                        className: "marching-ants",
                        lineCap: "round",
                        lineJoin: "round",
                      }}
                    />
                    {!isConnector && idx > 0 && (
                      <Marker position={leg.path[0]} icon={ICON_BUS}>
                        <Popup>
                          <div style={{ fontFamily: "sans-serif", minWidth: 130 }}>
                            <p style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>
                              {leg.mode} • Hub
                            </p>
                            <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
                              {leg.origin.split(",")[0]}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </LayerGroup>
                );
              })}

              <Marker position={sourcePos} icon={makeSourceIcon()}>
                <Popup>
                  <div style={{ fontFamily: "sans-serif", minWidth: 140 }}>
                    <p style={{ fontSize: 10, color: "#3B6FE8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🚩 Departure</p>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{activeRoute[0].origin.split(",")[0]}</p>
                  </div>
                </Popup>
              </Marker>

              <Marker position={destPos} icon={makeDestIcon()}>
                <Popup>
                  <div style={{ fontFamily: "sans-serif", minWidth: 140 }}>
                    <p style={{ fontSize: 10, color: "#D30C5C", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🏁 Destination</p>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{lastLeg.destination.split(",")[0]}</p>
                  </div>
                </Popup>
              </Marker>
            </LayerGroup>
          );
        })()}

        {/* Destination local markers */}
        {waypoints.map((wp, i) => (
          <Marker key={i} position={wp.pos} icon={wp.icon}>
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 120 }}>
                <p style={{ fontSize: 10, color: "#3B6FE8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>{wp.type}</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{wp.label}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pulsing current location marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={makeCurrentLocationIcon()}>
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 140 }}>
                <p style={{ fontSize: 10, color: "#3B6FE8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>📍 Your Location</p>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>
                  {currentLocation[0].toFixed(4)}° N, {currentLocation[1].toFixed(4)}° E
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Detected via GPS</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ════════════════════════════════════════════════════════════════════════
          OVERLAY CONTROLS
          FIX: pointerEvents:"none" on the container div lets Leaflet receive map
          drag/pan events. Each interactive button gets pointerEvents:"auto" so
          clicks still reach them. Without this, Leaflet's event listeners swallow
          the click before it reaches our button handlers.
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute top-8 right-8 flex flex-col gap-4"
        style={{ zIndex: 1000, pointerEvents: "none" }}
      >
        {/* Zoom controls */}
        <div
          className="glass-nav border border-white/20 p-2 rounded-2xl flex flex-col gap-2 shadow-xl"
          style={{ pointerEvents: "auto" }}
        >
          {/* FIX: call map.zoomIn() via ref instead of clicking a non-existent DOM element */}
          <button
            type="button"
            title="Zoom In"
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            onClick={() => mapRef.current?.zoomIn()}
          >
            <span className="material-symbols-outlined text-white">add</span>
          </button>
          <div className="h-px bg-white/10 mx-2" />
          <button
            type="button"
            title="Zoom Out"
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            onClick={() => mapRef.current?.zoomOut()}
          >
            <span className="material-symbols-outlined text-white">remove</span>
          </button>
        </div>

        {/* Use My Location button */}
        <button
          type="button"
          title="Use My Location"
          onClick={handleLocateMe}
          disabled={geoStatus === "loading"}
          style={{ pointerEvents: "auto" }}
          className={`glass-nav border w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:cursor-wait
            ${geoStatus === "success"
              ? "border-[#3B6FE8] bg-[#3B6FE8]/20 shadow-[0_0_20px_rgba(59,111,232,0.4)]"
              : (geoStatus === "denied" || geoStatus === "error" || geoStatus === "unavailable")
              ? "border-red-500/50 bg-red-900/20"
              : "border-white/20 hover:bg-white/10"
            }`}
        >
          <span
            className={`material-symbols-outlined text-white ${geoStatus === "loading" ? "animate-pulse" : ""}`}
            style={geoStatus === "success" ? { color: "#3B6FE8" } : {}}
          >
            {geoStatus === "loading" ? "refresh" : "my_location"}
          </span>
        </button>

        {/* Layer toggle */}
        <button
          type="button"
          title={layerMode === "dark" ? "Switch to Satellite" : "Switch to Dark"}
          onClick={() => setLayerMode(m => m === "dark" ? "satellite" : "dark")}
          style={{ pointerEvents: "auto" }}
          className="glass-nav border border-white/20 w-14 h-14 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-white">
            {layerMode === "dark" ? "satellite_alt" : "dark_mode"}
          </span>
        </button>
      </div>

      {/* Loading indicator */}
      {(loading || isGeocoding) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#050e1c]/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full flex items-center gap-2" style={{ zIndex: 1000 }}>
          <span className="material-symbols-outlined text-[#3B6FE8] text-base animate-spin">refresh</span>
          <span className="font-technical text-xs text-white/70 uppercase tracking-widest">Locating…</span>
        </div>
      )}

      {/* GPS blocked — manual city entry card */}
      {(geoStatus === "denied" || geoStatus === "unavailable") && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0a1422]/95 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-2xl"
          style={{ zIndex: 1000, pointerEvents: "auto", width: "min(340px, 90%)" }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="material-symbols-outlined text-red-400 text-base shrink-0">location_off</span>
            <p className="font-technical text-xs text-red-300 tracking-wide flex-1">GPS blocked — enter your city manually</p>
            <button
              type="button"
              onClick={() => { setGeoStatus("idle"); setGeoErrorMsg(""); setManualCity(""); }}
              className="text-white/30 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Manual input row */}
          <div className="flex gap-2 px-4 pb-4">
            <input
              type="text"
              value={manualCity}
              onChange={e => setManualCity(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && manualCity.trim()) {
                  setManualLoading(true);
                  import("@/lib/geocode").then(({ geocodePlace }) =>
                    geocodePlace(manualCity.trim()).then(result => {
                      setManualLoading(false);
                      if (result) {
                        setCenter([result.lat, result.lng]);
                        setMapZoom(11);
                        setFlyToTarget([result.lat, result.lng]);
                        setGeoLabel(result.displayName.split(",")[0]);
                        setGeoStatus("success");
                        if (onLocate) onLocate(manualCity.trim());
                      } else {
                        setGeoErrorMsg("City not found. Try a different name.");
                      }
                    })
                  );
                }
              }}
              placeholder="e.g. Mumbai, Kolkata…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#3B6FE8] transition-colors"
            />
            <button
              type="button"
              disabled={!manualCity.trim() || manualLoading}
              onClick={() => {
                if (!manualCity.trim()) return;
                setManualLoading(true);
                import("@/lib/geocode").then(({ geocodePlace }) =>
                  geocodePlace(manualCity.trim()).then(result => {
                    setManualLoading(false);
                    if (result) {
                      setCenter([result.lat, result.lng]);
                      setMapZoom(11);
                      setFlyToTarget([result.lat, result.lng]);
                      setGeoLabel(result.displayName.split(",")[0]);
                      setGeoStatus("success");
                      if (onLocate) onLocate(manualCity.trim());
                    } else {
                      setGeoErrorMsg("City not found. Try a different name.");
                    }
                  })
                );
              }}
              className="px-4 py-2 bg-[#3B6FE8] hover:bg-[#2d5bc9] disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              {manualLoading
                ? <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                : <span className="material-symbols-outlined text-sm">search</span>}
            </button>
          </div>

          {/* Inline error for bad city */}
          {geoErrorMsg && (
            <p className="font-technical text-[10px] text-red-400 px-4 pb-3 -mt-2">{geoErrorMsg}</p>
          )}
        </div>
      )}

      {/* Destination badge */}
      {geoLabel && !loading && !isGeocoding && geoStatus !== "denied" && geoStatus !== "error" && geoStatus !== "unavailable" && geoStatus !== "success" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#050e1c]/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full flex items-center gap-2" style={{ zIndex: 1000 }}>
          <span className="material-symbols-outlined text-[#3B6FE8] text-base">location_on</span>
          <span className="font-technical text-xs text-white/80 uppercase tracking-widest">{geoLabel}</span>
        </div>
      )}

      {/* GPS success badge */}
      {geoStatus === "success" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#050e1c]/80 backdrop-blur-sm border border-[#3B6FE8]/40 px-4 py-2 rounded-full flex items-center gap-2" style={{ zIndex: 1000 }}>
          <span className="material-symbols-outlined text-[#3B6FE8] text-base">my_location</span>
          <span className="font-technical text-xs text-white/80 uppercase tracking-widest">Live Location Active</span>
        </div>
      )}

      {/* Live Tracking card */}
      <div className="absolute bottom-10 left-10" style={{ zIndex: 1000, pointerEvents: "none" }}>
        <div className="glass-nav border border-white/20 p-5 rounded-3xl max-w-sm shadow-2xl backdrop-blur-2xl">
          <p className="font-technical text-[10px] uppercase tracking-widest font-bold text-[#3B6FE8] mb-3">Live Tracking</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-2xl text-white">directions_bus</span>
            </div>
            <div>
              <p className="font-headline font-bold text-white text-lg">En Route to {destination || "Destination"}</p>
              <p className="text-white/60 font-medium text-sm mt-1">
                {geoStatus === "success" ? `From: ${source || "Your Location"}` : "Arrival estimated 08:30 AM"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
