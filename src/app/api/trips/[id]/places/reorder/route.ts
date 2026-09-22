import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  const placeIds =
    Array.isArray(body.placeIds)
      ? body.placeIds.filter(
          (value: unknown) =>
            typeof value ===
            "string",
        )
      : [];

  if (placeIds.length === 0) {
    return NextResponse.json(
      {
        error: "invalid places",
      },
      { status: 400 },
    );
  }

  const {
    data: existingPlaces,
    error: placesError,
  } = await supabase
    .from("trip_places")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", user.id);

  if (placesError) {
    return NextResponse.json(
      {
        error:
          "could not load places",
      },
      { status: 500 },
    );
  }

  const existingIds =
    new Set(
      (existingPlaces ?? []).map(
        (place) => place.id,
      ),
    );

  if (
    placeIds.length !==
      existingIds.size ||
    placeIds.some(
      (id: string) =>
        !existingIds.has(id),
    )
  ) {
    return NextResponse.json(
      {
        error:
          "place order does not match trip",
      },
      { status: 400 },
    );
  }

  for (
    let index = 0;
    index < placeIds.length;
    index += 1
  ) {
    const { error } =
      await supabase
        .from("trip_places")
        .update({
          visit_order: index,
        })
        .eq(
          "id",
          placeIds[index],
        )
        .eq("trip_id", tripId)
        .eq(
          "user_id",
          user.id,
        );

    if (error) {
      console.error(
        "atlaslog reorder error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "could not reorder places",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    success: true,
  });
}