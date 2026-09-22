import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
    placeId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  const { id: tripId, placeId } =
    await params;

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
    data: deletedPlace,
    error,
  } = await supabase
    .from("trip_places")
    .delete()
    .eq("id", placeId)
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "atlaslog place delete error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "could not remove place",
      },
      {
        status: 500,
      },
    );
  }

  if (!deletedPlace) {
    return NextResponse.json(
      {
        error: "place not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    success: true,
  });
}