import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RouteMode =
  | "journey"
  | "road_trip"
  | "places_only";

export async function PATCH(
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

  const body = await request.json();

  const title =
    typeof body.title === "string"
      ? body.title.trim()
      : "";

  const notes =
    typeof body.notes === "string"
      ? body.notes.trim() || null
      : null;

  const routeMode: RouteMode =
    body.routeMode === "road_trip" ||
    body.routeMode === "places_only"
      ? body.routeMode
      : "journey";

  const returnsToStart =
    routeMode !== "places_only" &&
    body.returnsToStart === true;

  if (
    !title ||
    title.length > 120
  ) {
    return NextResponse.json(
      { error: "invalid title" },
      { status: 400 },
    );
  }

  if (
    notes &&
    notes.length > 5000
  ) {
    return NextResponse.json(
      { error: "notes are too long" },
      { status: 400 },
    );
  }

  const {
    data: trip,
    error,
  } = await supabase
    .from("trips")
    .update({
      title,
      notes,
      route_mode: routeMode,
      returns_to_start:
        returnsToStart,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", tripId)
    .eq("user_id", user.id)
    .select(
      "id, title, start_date, end_date, notes, route_mode, returns_to_start",
    )
    .maybeSingle();

  if (error) {
    console.error(
      "atlaslog trip update error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "could not update trip",
      },
      { status: 500 },
    );
  }

  if (!trip) {
    return NextResponse.json(
      { error: "trip not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    trip,
  });
}

export async function DELETE(
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
      { error: "unauthorized" },
      { status: 401 },
    );
  }

  const {
    data: deletedTrip,
    error,
  } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "atlaslog trip delete error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "could not delete trip",
      },
      { status: 500 },
    );
  }

  if (!deletedTrip) {
    return NextResponse.json(
      { error: "trip not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}