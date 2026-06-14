"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDirectionsUseCase } from "@/application/use-cases/maps/get-directions";
import { container } from "@/infrastructure/di/container";
import type { DirectionsResult } from "@/domain/entities/location";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_ORIGIN = { lat: 24.7136, lng: 46.6753 };
const DEFAULT_DEST = { lat: 21.3891, lng: 39.8579 };

export function DirectionsPanel() {
  const { toast } = useToast();
  const [origin, setOrigin] = useState({ lat: String(DEFAULT_ORIGIN.lat), lng: String(DEFAULT_ORIGIN.lng) });
  const [destination, setDestination] = useState({ lat: String(DEFAULT_DEST.lat), lng: String(DEFAULT_DEST.lng) });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DirectionsResult | null>(null);

  async function handleGetDirections() {
    setLoading(true);
    try {
      const directions = await getDirectionsUseCase(
        container.getDirectionsRepository(),
        { lat: Number(origin.lat), lng: Number(origin.lng) },
        { lat: Number(destination.lat), lng: Number(destination.lng) }
      );
      setResult(directions);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Directions failed",
        description: error instanceof Error ? error.message : "Unable to fetch route",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Planner
        </CardTitle>
        <CardDescription>Plan routes using Google Directions API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Origin (lat, lng)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={origin.lat} onChange={(e) => setOrigin((o) => ({ ...o, lat: e.target.value }))} />
              <Input value={origin.lng} onChange={(e) => setOrigin((o) => ({ ...o, lng: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" /> Destination (lat, lng)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={destination.lat} onChange={(e) => setDestination((d) => ({ ...d, lat: e.target.value }))} />
              <Input value={destination.lng} onChange={(e) => setDestination((d) => ({ ...d, lng: e.target.value }))} />
            </div>
          </div>
        </div>

        <Button onClick={handleGetDirections} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Calculating…" : "Get Directions"}
        </Button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="directions-result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3 rounded-lg border bg-muted/30 p-4"
            >
              {result.legs.map((leg, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">
                    {leg.distance} · {leg.duration}
                  </p>
                  <p className="text-muted-foreground">
                    {leg.startAddress} → {leg.endAddress}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
