import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type PlacePayload = {
  name?: unknown;
  kind?: unknown;
  countryCode?: unknown;
  countryName?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

export async function POST(
  request: Request,
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
      { error: "unauthorized" },
      { status: 401 },
    );
  }

  const body =
    (await request.json()) as PlacePayload;

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  const kind =
    body.kind === "country"
      ? "country"
      : "city";

  const countryCode =
    typeof body.countryCode === "string"
      ? body.countryCode
          .trim()
          .toUpperCase()
      : null;

  const countryName =
    typeof body.countryName === "string"
      ? body.countryName.trim()
      : null;

  const latitude =
    typeof body.latitude === "number"
      ? body.latitude
      : null;

  const longitude =
    typeof body.longitude === "number"
      ? body.longitude
      : null;

  if (
    !name ||
    name.length > 160
  ) {
    return NextResponse.json(
      { error: "invalid place name" },
      { status: 400 },
    );
  }

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "invalid coordinates" },
      { status: 400 },
    );
  }

  const {
    data: trip,
    error: tripError,
  } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (tripError) {
    return NextResponse.json(
      { error: "could not load trip" },
      { status: 500 },
    );
  }

  if (!trip) {
    return NextResponse.json(
      { error: "trip not found" },
      { status: 404 },
    );
  }

  const {
    data: existingPlaces,
    error: existingError,
  } = await supabase
    .from("trip_places")
    .select("visit_order")
    .eq("trip_id", tripId)
    .eq("user_id", user.id);

  if (existingError) {
    return NextResponse.json(
      {
        error:
          "could not determine place order",
      },
      { status: 500 },
    );
  }

  const maxOrder = Math.max(
    -1,
    ...(existingPlaces ?? []).map(
      (place) =>
        typeof place.visit_order ===
        "number"
          ? place.visit_order
          : -1,
    ),
  );

  const {
    data: place,
    error,
  } = await supabase
    .from("trip_places")
    .insert({
      trip_id: tripId,
      user_id: user.id,
      kind,
      name,
      country_code:
        countryCode,
      country_name:
        countryName,
      latitude,
      longitude,
      visit_order:
        maxOrder + 1,
    })
    .select(
      "id, trip_id, kind, name, country_code, country_name, latitude, longitude, visit_order",
    )
    .single();

  if (error) {
    console.error(
      "atlaslog place insert error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "could not add place",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    place,
  });
}