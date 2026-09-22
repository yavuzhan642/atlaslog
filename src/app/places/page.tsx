import {
  Globe2,
  MapPin,
  PlaneTakeoff,
} from "lucide-react";
import { redirect } from "next/navigation";

import { TripHighlightCard } from "@/components/places/trip-highlight-card";
import { VisitedWorldMap } from "@/components/places/visited-world-map";
import { PrimaryNav } from "@/components/primary-nav";
import { createClient } from "@/lib/supabase/server";

type Trip = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;

  cover_image_url:
    | string
    | null;

  cover_photo_url:
    | string
    | null;

  cover_photographer:
    | string
    | null;
};

type TripPlace = {
  trip_id: string;
  kind: string;
  name: string;

  country_code:
    | string
    | null;

  country_name:
    | string
    | null;

  visit_order:
    | number
    | null;
};

type CountrySummary = {
  code: string;
  name: string;
  places: Set<string>;
  trips: Set<string>;
};

type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;

  src: {
    original?: string;
    large2x?: string;
    large?: string;
    landscape?: string;
    medium?: string;
  };
};

type PexelsSearchResponse = {
  photos?: PexelsPhoto[];
};

type TripCover = {
  imageUrl: string;
  photoUrl: string;
  photographer: string;
  photographerUrl: string;
};

const WORLD_COUNTRY_TOTAL =
  195;

function countryCodeToFlag(
  countryCode: string,
) {
  if (
    countryCode.length !== 2
  ) {
    return "•";
  }

  return countryCode
    .toUpperCase()
    .split("")
    .map((character) =>
      String.fromCodePoint(
        127397 +
          character.charCodeAt(
            0,
          ),
      ),
    )
    .join("");
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getMonthParts(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const [yearValue, monthValue] =
    value.split("-");

  const year =
    Number(yearValue);

  const month =
    Number(monthValue);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return {
    year,
    month,
    monthLabel:
      SHORT_MONTHS[month - 1],
  };
}

function formatTripPeriod(
  startDate: string | null,
  endDate: string | null,
) {
  const start =
    getMonthParts(startDate);

  const end =
    getMonthParts(endDate);

  if (!start && !end) {
    return null;
  }

  if (start && end) {
    if (
      start.year === end.year &&
      start.month === end.month
    ) {
      return `${start.monthLabel} ${start.year}`;
    }

    if (
      start.year === end.year
    ) {
      return `${start.monthLabel} — ${end.monthLabel} ${end.year}`;
    }

    return `${start.monthLabel} ${start.year} — ${end.monthLabel} ${end.year}`;
  }

  const onlyDate =
    start ?? end;

  return onlyDate
    ? `${onlyDate.monthLabel} ${onlyDate.year}`
    : null;
}

async function searchPexels(
  query: string,
  apiKey: string,
): Promise<TripCover | null> {
  const params =
    new URLSearchParams({
      query,
      orientation:
        "landscape",
      size: "large",
      per_page: "1",
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
      console.error(
        "atlaslog pexels error:",
        response.status,
      );

      return null;
    }

    const data =
      (await response.json()) as PexelsSearchResponse;

    const photo =
      data.photos?.[0];

    if (!photo) {
      return null;
    }

    const imageUrl =
      photo.src.large2x ??
      photo.src.large ??
      photo.src.landscape ??
      photo.src.medium ??
      photo.src.original;

    if (!imageUrl) {
      return null;
    }

    return {
      imageUrl,

      photoUrl:
        photo.url,

      photographer:
        photo.photographer,

      photographerUrl:
        photo.photographer_url,
    };
  } catch (error) {
    console.error(
      "atlaslog pexels request error:",
      error,
    );

    return null;
  }
}

async function getTripCover(
  places: TripPlace[],
) {
  const apiKey =
    process.env
      .PEXELS_API_KEY;

  if (
    !apiKey ||
    places.length === 0
  ) {
    return null;
  }

  const orderedPlaces = [
    ...places,
  ].sort(
    (a, b) =>
      (a.visit_order ?? 0) -
      (b.visit_order ?? 0),
  );

  const firstPlace =
    orderedPlaces[0];

  const cityQuery = [
    firstPlace.name,
    firstPlace.country_name,
    "travel",
  ]
    .filter(Boolean)
    .join(" ");

  const cityCover =
    await searchPexels(
      cityQuery,
      apiKey,
    );

  if (cityCover) {
    return cityCover;
  }

  if (
    firstPlace.country_name
  ) {
    return searchPexels(
      `${firstPlace.country_name} travel`,
      apiKey,
    );
  }

  return null;
}

export default async function PlacesPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [
    tripsResponse,
    placesResponse,
  ] = await Promise.all([
    supabase
      .from("trips")
      .select(
        "id, title, start_date, end_date, created_at, cover_image_url, cover_photo_url, cover_photographer",
      )
      .eq(
        "user_id",
        user.id,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    supabase
      .from("trip_places")
      .select(
        "trip_id, kind, name, country_code, country_name, visit_order",
      )
      .eq(
        "user_id",
        user.id,
      ),
  ]);

  if (
    tripsResponse.error
  ) {
    throw new Error(
      `could not load trips: ${tripsResponse.error.message}`,
    );
  }

  if (
    placesResponse.error
  ) {
    throw new Error(
      `could not load places: ${placesResponse.error.message}`,
    );
  }

  const trips =
    (tripsResponse.data ??
      []) as Trip[];

  const places =
    (placesResponse.data ??
      []) as TripPlace[];

  const uniquePlaces =
    new Set<string>();

  const countries =
    new Map<
      string,
      CountrySummary
    >();

  const placesByTrip =
    new Map<
      string,
      TripPlace[]
    >();

  for (
    const place of places
  ) {
    const tripPlaces =
      placesByTrip.get(
        place.trip_id,
      ) ?? [];

    tripPlaces.push(
      place,
    );

    placesByTrip.set(
      place.trip_id,
      tripPlaces,
    );

    const countryCode =
      place.country_code
        ?.trim()
        .toUpperCase();

    if (!countryCode) {
      continue;
    }

    const placeKey =
      `${countryCode}:${place.name
        .trim()
        .toLowerCase()}`;

    uniquePlaces.add(
      placeKey,
    );

    const current =
      countries.get(
        countryCode,
      ) ?? {
        code:
          countryCode,

        name:
          place.country_name?.trim() ||
          countryCode,

        places:
          new Set<string>(),

        trips:
          new Set<string>(),
      };

    current.places.add(
      placeKey,
    );

    current.trips.add(
      place.trip_id,
    );

    countries.set(
      countryCode,
      current,
    );
  }

  const countryList = [
    ...countries.values(),
  ].sort((a, b) => {
    const difference =
      b.places.size -
      a.places.size;

    if (
      difference !== 0
    ) {
      return difference;
    }

    return a.name.localeCompare(
      b.name,
    );
  });

  const worldVisited =
    countryList.length;

  const worldPercentage =
    Math.round(
      (worldVisited /
        WORLD_COUNTRY_TOTAL) *
        100,
    );

  const visitedCountryCodes =
    countryList.map(
      (country) =>
        country.code,
    );

  const highlightTrips =
    trips.slice(0, 6);

  const highlights =
    await Promise.all(
      highlightTrips.map(
        async (trip) => {
          const tripPlaces = [
            ...(placesByTrip.get(
              trip.id,
            ) ?? []),
          ].sort(
            (a, b) =>
              (a.visit_order ??
                0) -
              (b.visit_order ??
                0),
          );

          const automaticCover =
            await getTripCover(
              tripPlaces,
            );

          return {
            trip,
            places:
              tripPlaces,
            automaticCover,
          };
        },
      ),
    );

  return (
    <main className="min-h-screen bg-[#090b0e] text-white">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-5 pt-5 pb-36 sm:px-8 sm:pt-6 sm:pb-36">
        <section className="mt-3 sm:mt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.055] text-white/65">
              <MapPin
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em]">
              places
            </h1>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-6 text-white/40">
            a quiet overview of
            everywhere your atlas
            has taken you.
          </p>

          <div className="mt-10">
            <VisitedWorldMap
              countryCodes={
                visitedCountryCodes
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs text-white/35">
                  world explored
                </p>

                <p className="mt-2 text-sm text-white/55">
                  {worldVisited} of{" "}
                  {
                    WORLD_COUNTRY_TOTAL
                  }{" "}
                  countries
                </p>
              </div>

              <p className="text-2xl font-semibold tracking-[-0.04em]">
                {
                  worldPercentage
                }
                %
              </p>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-white/80 transition-[width] duration-700"
                style={{
                  width: `${worldPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/35">
                  countries
                </p>

                <Globe2
                  size={15}
                  className="text-white/25"
                />
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                {
                  countryList.length
                }
              </p>

              <p className="mt-1 text-xs text-white/25">
                visited
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/35">
                  places
                </p>

                <MapPin
                  size={15}
                  className="text-white/25"
                />
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                {
                  uniquePlaces.size
                }
              </p>

              <p className="mt-1 text-xs text-white/25">
                unique locations
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/35">
                  trips
                </p>

                <PlaneTakeoff
                  size={15}
                  className="text-white/25"
                />
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                {trips.length}
              </p>

              <p className="mt-1 text-xs text-white/25">
                logged
              </p>
            </div>
          </div>

          {highlights.length >
            0 && (
            <div className="mt-14 border-t border-white/[0.07] pt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-white/35">
                    trip highlights
                  </p>

                  <p className="mt-1 text-sm text-white/30">
                    moments from
                    your recent
                    travels.
                  </p>
                </div>

                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-white/25 transition hover:text-white/50"
                >
                  photos provided
                  by pexels
                </a>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {highlights.map(
                  ({
                    trip,
                    places:
                      tripPlaces,
                    automaticCover,
                  }) => {
                    const period =
                      formatTripPeriod(
                        trip.start_date,
                        trip.end_date,
                      );

                    const countryCodes: string[] = [];

                    for (
                      const place of tripPlaces
                    ) {
                      const countryCode =
                        place.country_code
                          ?.trim()
                          .toUpperCase();

                      if (
                        countryCode &&
                        !countryCodes.includes(
                          countryCode,
                        )
                      ) {
                        countryCodes.push(
                          countryCode,
                        );
                      }
                    }

                    const flag =
                      countryCodes.length > 0
                        ? countryCodes
                            .map(
                              countryCodeToFlag,
                            )
                            .join(" ")
                        : "•";

                    const placeNames =
                      tripPlaces
                        .slice(0, 4)
                        .map(
                          (place) =>
                            place.name,
                        );

                    const savedCover =
                      trip.cover_image_url &&
                      trip.cover_photo_url &&
                      trip.cover_photographer
                        ? {
                            imageUrl:
                              trip.cover_image_url,

                            photoUrl:
                              trip.cover_photo_url,

                            photographer:
                              trip.cover_photographer,
                          }
                        : null;

                    return (
                      <TripHighlightCard
                        key={
                          trip.id
                        }
                        tripId={
                          trip.id
                        }
                        title={
                          trip.title
                        }
                        flag={
                          flag
                        }
                        dateLabel={
                          period
                        }
                        placeNames={
                          placeNames
                        }
                        placeCount={
                          tripPlaces.length
                        }
                        automaticCover={
                          automaticCover
                            ? {
                                imageUrl:
                                  automaticCover.imageUrl,

                                photoUrl:
                                  automaticCover.photoUrl,

                                photographer:
                                  automaticCover.photographer,
                              }
                            : null
                        }
                        savedCover={
                          savedCover
                        }
                      />
                    );
                  },
                )}
              </div>
            </div>
          )}

          <div className="mt-14 border-t border-white/[0.07] pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-white/35">
                  countries
                </p>

                <p className="mt-1 text-sm text-white/30">
                  places grouped
                  across your trips.
                </p>
              </div>

              <span className="text-xs tabular-nums text-white/25">
                {
                  countryList.length
                }
              </span>
            </div>

            {countryList.length ===
            0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/[0.1] px-5 py-10">
                <p className="text-sm text-white/50">
                  no places yet.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {countryList.map(
                  (
                    country,
                  ) => (
                    <div
                      key={
                        country.code
                      }
                      className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 transition hover:border-white/[0.13] hover:bg-white/[0.04]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-xl">
                        {countryCodeToFlag(
                          country.code,
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white/80">
                          {
                            country.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {
                            country
                              .places
                              .size
                          }{" "}
                          {country
                            .places
                            .size ===
                          1
                            ? "place"
                            : "places"}

                          <span className="mx-1.5">
                            ·
                          </span>

                          {
                            country
                              .trips
                              .size
                          }{" "}
                          {country
                            .trips
                            .size ===
                          1
                            ? "trip"
                            : "trips"}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <PrimaryNav />
    </main>
  );
}