import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;

  src: {
    large2x?: string;
    large?: string;
    landscape?: string;
    medium?: string;
    original?: string;
  };
};

type PexelsResponse = {
  photos?: PexelsPhoto[];
};

type CoverCandidate = {
  id: number;
  imageUrl: string;
  photoUrl: string;
  photographer: string;
  place: string;
};

function pickPlaces<T>(
  places: T[],
  maximum = 4,
) {
  if (
    places.length <= maximum
  ) {
    return places;
  }

  const indexes = new Set([
    0,
    Math.round(
      (places.length - 1) /
        3,
    ),
    Math.round(
      ((places.length - 1) *
        2) /
        3,
    ),
    places.length - 1,
  ]);

  return Array.from(
    indexes,
  )
    .sort(
      (a, b) => a - b,
    )
    .map(
      (index) =>
        places[index],
    );
}

async function searchPexels(
  apiKey: string,
  placeName: string,
  countryName: string | null,
) {
  const query = [
    placeName,
    countryName,
    "travel landscape",
  ]
    .filter(Boolean)
    .join(" ");

  const params =
    new URLSearchParams({
      query,
      orientation:
        "landscape",
      size: "large",
      per_page: "3",
    });

  try {
    const response =
      await fetch(
        `https://api.pexels.com/v1/search?${params.toString()}`,
        {
          headers: {
            Authorization:
              apiKey,
          },

          next: {
            revalidate:
              60 *
              60 *
              24 *
              7,
          },
        },
      );

    if (!response.ok) {
      return [];
    }

    const data =
      (await response.json()) as PexelsResponse;

    return (
      data.photos ?? []
    )
      .map(
        (
          photo,
        ): CoverCandidate | null => {
          const imageUrl =
            photo.src
              .large2x ??
            photo.src.large ??
            photo.src
              .landscape ??
            photo.src.medium ??
            photo.src.original;

          if (!imageUrl) {
            return null;
          }

          return {
            id:
              photo.id,

            imageUrl,

            photoUrl:
              photo.url,

            photographer:
              photo.photographer,

            place:
              placeName,
          };
        },
      )
      .filter(
        (
          candidate,
        ): candidate is CoverCandidate =>
          candidate !==
          null,
      );
  } catch (error) {
    console.error(
      "atlaslog cover search error:",
      error,
    );

    return [];
  }
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const {
    data: trip,
    error: tripError,
  } =
    await supabase
      .from("trips")
      .select("id")
      .eq("id", id)
      .eq(
        "user_id",
        user.id,
      )
      .single();

  if (
    tripError ||
    !trip
  ) {
    return NextResponse.json(
      {
        error:
          "trip not found",
      },
      {
        status: 404,
      },
    );
  }

  const {
    data: places,
    error: placesError,
  } =
    await supabase
      .from("trip_places")
      .select(
        "name, country_name, visit_order",
      )
      .eq(
        "trip_id",
        id,
      )
      .eq(
        "user_id",
        user.id,
      )
      .order(
        "visit_order",
        {
          ascending: true,
        },
      );

  if (placesError) {
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

  const apiKey =
    process.env
      .PEXELS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "photo service is unavailable",
      },
      {
        status: 500,
      },
    );
  }

  const selectedPlaces =
    pickPlaces(
      places ?? [],
      4,
    );

  const candidateGroups =
    await Promise.all(
      selectedPlaces.map(
        (place) =>
          searchPexels(
            apiKey,
            place.name,
            place.country_name,
          ),
      ),
    );

  const seen =
    new Set<number>();

  const candidates:
    CoverCandidate[] = [];

  for (
    const candidate of
    candidateGroups.flat()
  ) {
    if (
      seen.has(
        candidate.id,
      )
    ) {
      continue;
    }

    seen.add(
      candidate.id,
    );

    candidates.push(
      candidate,
    );

    if (
      candidates.length >=
      8
    ) {
      break;
    }
  }

  return NextResponse.json({
    candidates,
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  let body: {
    imageUrl?: string;
    photoUrl?: string;
    photographer?: string;
  };

  try {
    body =
      (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      {
        error:
          "invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const imageUrl =
    body.imageUrl?.trim();

  const photoUrl =
    body.photoUrl?.trim();

  const photographer =
    body.photographer?.trim();

  if (
    !imageUrl ||
    !photoUrl ||
    !photographer
  ) {
    return NextResponse.json(
      {
        error:
          "invalid cover",
      },
      {
        status: 400,
      },
    );
  }

  const {
    data: trip,
    error,
  } =
    await supabase
      .from("trips")
      .update({
        cover_image_url:
          imageUrl,

        cover_photo_url:
          photoUrl,

        cover_photographer:
          photographer,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .eq(
        "user_id",
        user.id,
      )
      .select(
        "cover_image_url, cover_photo_url, cover_photographer",
      )
      .single();

  if (
    error ||
    !trip
  ) {
    return NextResponse.json(
      {
        error:
          "could not save cover",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    cover: {
      imageUrl:
        trip.cover_image_url,

      photoUrl:
        trip.cover_photo_url,

      photographer:
        trip.cover_photographer,
    },
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { error } =
    await supabase
      .from("trips")
      .update({
        cover_image_url:
          null,

        cover_photo_url:
          null,

        cover_photographer:
          null,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .eq(
        "user_id",
        user.id,
      );

  if (error) {
    return NextResponse.json(
      {
        error:
          "could not reset cover",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    success: true,
  });
}