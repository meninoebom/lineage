"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Center } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon paths in webpack/Next.js bundling
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#8b4b2c;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

interface CentersMapProps {
  centers: Center[];
  traditionNames: Record<string, string>;
}

export function CentersMap({ centers, traditionNames }: CentersMapProps) {
  useEffect(() => {
    // Leaflet needs a valid icon URL — suppress the broken default asset lookup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "",
      iconUrl: "",
      shadowUrl: "",
    });
  }, []);

  const withCoords = centers.filter(
    (c) => c.latitude != null && c.longitude != null
  );

  return (
    <MapContainer
      center={[38.5, -96]}
      zoom={4}
      style={{ height: "560px", width: "100%", borderRadius: "0.5rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CartoDB</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {withCoords.map((center) => (
        <Marker
          key={center.slug}
          position={[center.latitude!, center.longitude!]}
          icon={pinIcon}
        >
          <Popup>
            <div className="min-w-[160px]">
              <Link
                href={`/centers/${center.slug}`}
                className="font-semibold text-sm hover:underline block mb-1"
              >
                {center.name}
              </Link>
              <p className="text-xs text-muted-foreground mb-2">
                {center.city}, {center.state}
              </p>
              <div className="flex flex-wrap gap-1">
                {center.traditions.slice(0, 3).map((slug) => (
                  <Badge key={slug} variant="tradition" className="text-[10px]">
                    {traditionNames[slug] ?? slug}
                  </Badge>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
