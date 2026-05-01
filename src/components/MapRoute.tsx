"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon issue with webpack/nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapRoute({ days }: { days: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl" />;

  const validPoints = days
    .filter(d => d.coordinates && d.coordinates.lat && d.coordinates.lng)
    .map(d => ({ lat: d.coordinates.lat, lng: d.coordinates.lng, title: d.title, day: d.day }));

  if (validPoints.length === 0) return null;

  const positions: [number, number][] = validPoints.map(p => [p.lat, p.lng]);
  const center = positions[0];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0 mt-6">
      <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validPoints.map((point, idx) => (
          <Marker key={idx} position={[point.lat, point.lng]}>
            <Popup>
              <strong>วันที่ {point.day}</strong><br />{point.title}
            </Popup>
          </Marker>
        ))}
        {positions.length > 1 && <Polyline positions={positions} color="#f97316" weight={3} dashArray="5, 10" />}
      </MapContainer>
    </div>
  );
}
