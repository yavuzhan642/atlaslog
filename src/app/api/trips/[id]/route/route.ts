import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type TripPlace = {
  latitude: number | null;
  longitude: number | null;
  visit_order: number | null;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { id: tripId } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const {
    data: trip,
    error: tripError,
  } = await supabase
    .from("trips")
    .select(
      "id, route_mode, returns_to_start",
    )
    .eq("id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (tripError) {
    console.error(
      "atlaslog route trip error:",
      tripError,
    );

    return NextResponse.json(
      {
        error: "could not load trip",
      },
      {
        status: 500,
      },
    );
  }

  if (!trip) {
    return NextResponse.json(
      {
        error: "trip not found",
      },
      {
        status: 404,
      },
    );
  }

  if (
    trip.route_mode !== "road_trip"
  ) {
    return NextResponse.json(
      {
        error:
          "trip is not a road trip",
      },
      {
        status: 400,
      },
    );
  }

  const {
    data: placesData,
    error: placesError,
  } = await supabase
    .from("trip_places")
    .select(
      "latitude, longitude, visit_order",
    )
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("visit_order", {
      ascending: true,
    });

  if (placesError) {
    console.error(
      "atlaslog route places error:",
      placesError,
    );

    return NextResponse.json(
      {
        error:
          "could not load trip places",
      },
      {
        status: 500,
      },
    );
  }

  const places =
    (placesData ??
      []) as TripPlace[];

  const coordinates = places
    .filter(
      (
        place,
      ): place is TripPlace & {
        latitude: number;
        longitude: number;
      } =>
        place.latitude !== null &&
        place.longitude !== null,
    )
    .map(
      (place) =>
        [
          place.longitude,
          place.latitude,
        ] as [
          number,
          number,
        ],
    );

  if (coordinates.length < 2) {
    return NextResponse.json(
      {
        error:
          "at least two places are required",
      },
      {
        status: 400,
      },
    );
  }

  if (
    trip.returns_to_start &&
    coordinates.length >= 2
  ) {
    coordinates.push(
      coordinates[0],
    );
  }

  const apiKey =
    process.env
      .OPENROUTESERVICE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "routing configuration is missing",
      },
      {
        status: 500,
      },
    );
  }

  const response = await fetch(
    "https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type":
          "application/json",
        Accept:
          "application/geo+json, application/json",
      },
      body: JSON.stringify({
        coordinates,
        instructions: false,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    console.error(
      "atlaslog ors error:",
      response.status,
      message,
    );

    return NextResponse.json(
      {
        error:
          "could not calculate road route",
      },
      {
        status: 502,
      },
    );
  }

  const geojson =
    await response.json();

  return NextResponse.json(
    geojson,
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}