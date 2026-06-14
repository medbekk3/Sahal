import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  originLat: z.coerce.number(),
  originLng: z.coerce.number(),
  destLat: z.coerce.number(),
  destLng: z.coerce.number(),
});

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key is not configured" },
      { status: 500 }
    );
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { originLat, originLng, destLat, destLng } = parsed.data;

  const params = new URLSearchParams({
    origin: `${originLat},${originLng}`,
    destination: `${destLat},${destLng}`,
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Directions API request failed" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
