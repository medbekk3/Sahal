"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useMemo } from "react";
import type { GeoPoint } from "@/domain/entities/location";

const mapContainerStyle = { width: "100%", height: "100%" };

interface MapViewProps {
  center: GeoPoint;
  markers?: Array<{ id: string; position: GeoPoint; label?: string }>;
  zoom?: number;
  className?: string;
}

function MapCanvas({ center, markers, zoom }: Pick<MapViewProps, "center" | "markers" | "zoom">) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "google-maps-script",
  });

  const options = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    }),
    []
  );

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        Google Maps could not load. Check your API key and reload the page.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom} options={options}>
      {markers?.map((marker) => (
        <Marker key={marker.id} position={marker.position} label={marker.label} />
      ))}
    </GoogleMap>
  );
}

export function MapView({ center, markers = [], zoom = 12, className }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (!apiKey) {
    return (
      <div
        className={`flex h-full items-center justify-center rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground ${
          className ?? ""
        }`}
      >
        Google Maps is disabled until `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set.
      </div>
    );
  }

  return (
    <div className={className}>
      <MapCanvas center={center} markers={markers} zoom={zoom} />
    </div>
  );
}
